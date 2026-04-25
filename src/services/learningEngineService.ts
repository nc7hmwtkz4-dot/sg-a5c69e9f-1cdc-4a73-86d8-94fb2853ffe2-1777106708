import { supabase } from "@/integrations/supabase/client";

/**
 * LEARNING ENGINE SERVICE
 * Implements the weighted average learning algorithm from the PRD
 * Calculates accurate part bonuses by analyzing real observations
 */

// PRD Initial weights for relative proportions (page 5)
const PRD_WEIGHTS: { [key: string]: number } = {
  Stock: 0,
  Gris: 3612,
  Singuliere: 10815,
  Rare: 54040,
  Epique: 324162,
  Legendaire: 3500000,
  Secrete: 0,
};

interface LearningResult {
  globalWeights: { [key: string]: { avgPrice: number; avgRep: number; count: number } };
  typeWeights: { [typeId: number]: { [rarity: string]: { avgPrice: number; avgRep: number; count: number } } };
  observationsProcessed: number;
}

/**
 * Main learning function - analyzes all observations and updates averages
 */
export async function runLearningAlgorithm(): Promise<LearningResult> {
  console.log("🧠 Starting Learning Engine...");

  // Fetch all observations with car details
  const { data: observations, error } = await supabase
    .from("observations")
    .select(`
      *,
      cars!inner(
        id,
        base_price_min,
        base_reputation,
        type_id
      )
    `)
    .order("created_at", { ascending: true });

  if (error || !observations) {
    console.error("Error fetching observations:", error);
    throw error;
  }

  console.log(`📊 Processing ${observations.length} observations...`);

  // Initialize accumulators for global weights
  const globalAccumulators: { [key: string]: { totalPrice: number; totalRep: number; count: number } } = {};
  
  // Initialize accumulators for type-specific weights
  const typeAccumulators: { 
    [typeId: number]: { 
      [rarity: string]: { totalPrice: number; totalRep: number; count: number } 
    } 
  } = {};

  // Process each observation
  observations.forEach((obs) => {
    const car = obs.cars;
    if (!car) return;

    const basePrice = car.base_price_min || 0;
    const baseRep = car.base_reputation || 0;
    const typeId = car.type_id;

    // Calculate total bonus from this observation
    const totalPriceBonus = (obs.price_min_total || 0) - basePrice;
    const totalRepBonus = (obs.rep_total || 0) - baseRep;

    // Count parts by rarity
    const partCounts: { [key: string]: number } = {};
    const parts = [
      obs.engine_rarity,
      obs.clutch_rarity,
      obs.turbo1_rarity,
      obs.turbo2_rarity,
      obs.suspension1_rarity,
      obs.suspension2_rarity,
      obs.transmission_rarity,
      obs.tires_rarity,
    ];

    parts.forEach((rarity) => {
      if (rarity && rarity !== "Stock") {
        partCounts[rarity] = (partCounts[rarity] || 0) + 1;
      }
    });

    // Calculate total weight for this observation (using PRD weights as proportions)
    let totalWeight = 0;
    Object.entries(partCounts).forEach(([rarity, count]) => {
      totalWeight += (PRD_WEIGHTS[rarity] || 0) * count;
    });

    if (totalWeight === 0) return; // Skip if no upgraded parts

    // Distribute bonuses proportionally and accumulate
    Object.entries(partCounts).forEach(([rarity, count]) => {
      const weight = PRD_WEIGHTS[rarity] || 0;
      const proportion = (weight * count) / totalWeight;
      const priceContribution = (totalPriceBonus * proportion) / count;
      const repContribution = (totalRepBonus * proportion) / count;

      // Accumulate for global weights
      if (!globalAccumulators[rarity]) {
        globalAccumulators[rarity] = { totalPrice: 0, totalRep: 0, count: 0 };
      }
      globalAccumulators[rarity].totalPrice += priceContribution;
      globalAccumulators[rarity].totalRep += repContribution;
      globalAccumulators[rarity].count += 1;

      // Accumulate for type-specific weights
      if (!typeAccumulators[typeId]) {
        typeAccumulators[typeId] = {};
      }
      if (!typeAccumulators[typeId][rarity]) {
        typeAccumulators[typeId][rarity] = { totalPrice: 0, totalRep: 0, count: 0 };
      }
      typeAccumulators[typeId][rarity].totalPrice += priceContribution;
      typeAccumulators[typeId][rarity].totalRep += repContribution;
      typeAccumulators[typeId][rarity].count += 1;
    });
  });

  // Calculate final averages
  const globalWeights: { [key: string]: { avgPrice: number; avgRep: number; count: number } } = {};
  Object.entries(globalAccumulators).forEach(([rarity, acc]) => {
    globalWeights[rarity] = {
      avgPrice: acc.totalPrice / acc.count,
      avgRep: acc.totalRep / acc.count,
      count: acc.count,
    };
  });

  const typeWeights: { [typeId: number]: { [rarity: string]: { avgPrice: number; avgRep: number; count: number } } } = {};
  Object.entries(typeAccumulators).forEach(([typeIdStr, rarities]) => {
    const typeId = parseInt(typeIdStr);
    typeWeights[typeId] = {};
    Object.entries(rarities).forEach(([rarity, acc]) => {
      typeWeights[typeId][rarity] = {
        avgPrice: acc.totalPrice / acc.count,
        avgRep: acc.totalRep / acc.count,
        count: acc.count,
      };
    });
  });

  console.log("✅ Learning complete!");
  console.log("Global weights:", globalWeights);
  console.log("Type-specific weights:", typeWeights);

  return {
    globalWeights,
    typeWeights,
    observationsProcessed: observations.length,
  };
}

/**
 * Update database with learned weights
 */
export async function applyLearningResults(results: LearningResult): Promise<void> {
  console.log("💾 Updating database with learned weights...");

  // Update global part_weights
  for (const [rarity, weights] of Object.entries(results.globalWeights)) {
    const { error } = await supabase
      .from("part_weights")
      .update({
        bonus_price_min_avg: Math.round(weights.avgPrice),
        bonus_reputation_avg: Math.round(weights.avgRep),
        observation_count: weights.count,
      })
      .eq("rarity", rarity);

    if (error) {
      console.error(`Error updating global weights for ${rarity}:`, error);
    }
  }

  // Clear and update type-specific weights
  await supabase.from("part_weights_by_type").delete().neq("car_type_id", 0);

  for (const [typeIdStr, rarities] of Object.entries(results.typeWeights)) {
    const typeId = parseInt(typeIdStr);
    for (const [rarity, weights] of Object.entries(rarities)) {
      const { error } = await supabase
        .from("part_weights_by_type")
        .insert({
          car_type_id: typeId,
          part_rarity: rarity,
          bonus_price_min_avg: Math.round(weights.avgPrice),
          bonus_reputation_avg: Math.round(weights.avgRep),
          observation_count: weights.count,
        });

      if (error) {
        console.error(`Error inserting type weight for type ${typeId}, rarity ${rarity}:`, error);
      }
    }
  }

  console.log("✅ Database updated successfully!");
}

/**
 * Complete learning workflow - run algorithm and update DB
 */
export async function runCompleteLearnin(): Promise<void> {
  try {
    const results = await runLearningAlgorithm();
    await applyLearningResults(results);
    console.log(`🎓 Learning complete! Processed ${results.observationsProcessed} observations.`);
  } catch (error) {
    console.error("❌ Learning failed:", error);
    throw error;
  }
}