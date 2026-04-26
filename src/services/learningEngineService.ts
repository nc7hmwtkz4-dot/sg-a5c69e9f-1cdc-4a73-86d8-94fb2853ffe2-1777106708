import { supabase } from "@/integrations/supabase/client";

/**
 * SIMPLE LEARNING ENGINE - Calculate part bonuses by car type
 * 
 * For each observation:
 * 1. Total bonus = price_min - base_price_min
 * 2. Count non-stock parts by rarity
 * 3. Divide total bonus by number of parts → bonus per part
 * 4. Average all observations for each (type_id, rarity) combination
 */

interface ObservationData {
  id: number;
  car_id: number;
  type_id: number;
  base_price_min: number;
  price_min_total: number;
  parts: {
    engine: string;
    clutch: string;
    turbo1: string;
    turbo2: string;
    suspension1: string;
    suspension2: string;
    transmission: string;
    tires: string;
  };
}

interface PartBonus {
  rarity: string;
  bonus: number;
  count: number;
}

interface TypeRarityAverage {
  type_id: number;
  rarity: string;
  total_bonus: number;
  observation_count: number;
  avg_bonus: number;
}

/**
 * Fetch all observations with car type info
 */
async function fetchAllObservations(): Promise<ObservationData[]> {
  const { data, error } = await supabase
    .from("observations")
    .select(`
      id,
      car_id,
      price_min_total,
      engine_rarity,
      clutch_rarity,
      turbo1_rarity,
      turbo2_rarity,
      suspension1_rarity,
      suspension2_rarity,
      transmission_rarity,
      tires_rarity,
      cars!inner(
        type_id,
        base_price_min
      )
    `)
    .not("price_min_total", "is", null);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No observations found in database");
  }

  return data.map((obs: any) => ({
    id: obs.id,
    car_id: obs.car_id,
    type_id: obs.cars.type_id,
    base_price_min: obs.cars.base_price_min,
    price_min_total: obs.price_min_total,
    parts: {
      engine: obs.engine_rarity || "Stock",
      clutch: obs.clutch_rarity || "Stock",
      turbo1: obs.turbo1_rarity || "Stock",
      turbo2: obs.turbo2_rarity || "Stock",
      suspension1: obs.suspension1_rarity || "Stock",
      suspension2: obs.suspension2_rarity || "Stock",
      transmission: obs.transmission_rarity || "Stock",
      tires: obs.tires_rarity || "Stock"
    }
  }));
}

/**
 * Calculate part bonuses for a single observation
 * Simple division: total bonus / number of parts
 */
function calculateObservationBonuses(obs: ObservationData): PartBonus[] {
  const totalBonus = obs.price_min_total - obs.base_price_min;
  
  // Count parts by rarity
  const partCounts: Record<string, number> = {};
  const allParts = Object.values(obs.parts);
  
  for (const rarity of allParts) {
    if (rarity === "Stock") continue;
    partCounts[rarity] = (partCounts[rarity] || 0) + 1;
  }

  const totalNonStockParts = Object.values(partCounts).reduce((sum, count) => sum + count, 0);
  
  if (totalNonStockParts === 0) {
    return []; // All stock - no bonuses to calculate
  }

  // Simple division: bonus per part = total bonus / number of parts
  const bonusPerPart = totalBonus / totalNonStockParts;

  return Object.entries(partCounts).map(([rarity, count]) => ({
    rarity,
    bonus: bonusPerPart,
    count
  }));
}

/**
 * Run the learning algorithm
 */
export async function runLearningAlgorithm(): Promise<{
  globalAverages: Record<string, { bonus: number; count: number }>;
  typeAverages: TypeRarityAverage[];
  observationsProcessed: number;
}> {
  console.log("🎓 Starting learning algorithm...");

  // Fetch all observations
  const observations = await fetchAllObservations();
  console.log(`📊 Processing ${observations.length} observations...`);

  // Accumulators
  const globalAccumulator: Record<string, { total: number; count: number }> = {};
  const typeAccumulator: Record<string, { total: number; count: number }> = {}; // key: "typeId-rarity"

  // Process each observation
  for (const obs of observations) {
    const bonuses = calculateObservationBonuses(obs);
    
    for (const { rarity, bonus } of bonuses) {
      // Global accumulator
      if (!globalAccumulator[rarity]) {
        globalAccumulator[rarity] = { total: 0, count: 0 };
      }
      globalAccumulator[rarity].total += bonus;
      globalAccumulator[rarity].count += 1;

      // Type-specific accumulator
      const typeKey = `${obs.type_id}-${rarity}`;
      if (!typeAccumulator[typeKey]) {
        typeAccumulator[typeKey] = { total: 0, count: 0 };
      }
      typeAccumulator[typeKey].total += bonus;
      typeAccumulator[typeKey].count += 1;
    }
  }

  // Calculate global averages
  const globalAverages: Record<string, { bonus: number; count: number }> = {};
  for (const [rarity, acc] of Object.entries(globalAccumulator)) {
    globalAverages[rarity] = {
      bonus: acc.total / acc.count,
      count: acc.count
    };
  }

  // Calculate type-specific averages
  const typeAverages: TypeRarityAverage[] = [];
  for (const [key, acc] of Object.entries(typeAccumulator)) {
    const [typeIdStr, rarity] = key.split("-");
    const type_id = parseInt(typeIdStr);
    typeAverages.push({
      type_id,
      rarity,
      total_bonus: acc.total,
      observation_count: acc.count,
      avg_bonus: acc.total / acc.count
    });
  }

  console.log(`✅ Calculated averages for ${Object.keys(globalAverages).length} global rarities`);
  console.log(`✅ Calculated averages for ${typeAverages.length} type-specific combinations`);

  return {
    globalAverages,
    typeAverages,
    observationsProcessed: observations.length
  };
}

/**
 * Apply learning results to database
 */
async function applyLearningResults(results: {
  globalAverages: Record<string, { bonus: number; count: number }>;
  typeAverages: TypeRarityAverage[];
}): Promise<void> {
  console.log("💾 Applying learning results to database...");

  // Update global part_weights
  for (const [rarity, data] of Object.entries(results.globalAverages)) {
    const { error } = await supabase
      .from("part_weights")
      .update({
        bonus_price_min_avg: data.bonus,
        observation_count: data.count
      })
      .eq("rarity", rarity);

    if (error) {
      console.error(`Error updating part_weights for ${rarity}:`, error);
      throw error;
    }
  }

  // Clear and repopulate part_weights_by_type
  await supabase.from("part_weights_by_type").delete().neq("type_id", 0);

  for (const typeAvg of results.typeAverages) {
    const { error } = await supabase
      .from("part_weights_by_type")
      .insert({
        type_id: typeAvg.type_id,
        part_rarity: typeAvg.rarity,
        bonus_price_min_avg: typeAvg.avg_bonus,
        observation_count: typeAvg.observation_count
      });

    if (error) {
      console.error(`Error inserting type average:`, error);
      throw error;
    }
  }

  console.log("✅ Database updated successfully");
}

/**
 * Complete learning workflow - run algorithm and update DB
 */
export async function runCompleteLearning(): Promise<void> {
  try {
    const results = await runLearningAlgorithm();
    await applyLearningResults(results);
    console.log(`🎓 Learning complete! Processed ${results.observationsProcessed} observations.`);
  } catch (error) {
    console.error("❌ Learning failed:", error);
    throw error;
  }
}