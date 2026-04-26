import { supabase } from "@/integrations/supabase/client";

/**
 * LEARNING ENGINE SERVICE v2.0
 * Implements an iterative weighted average learning algorithm
 * Phase 1: Extract pure observations (single rarity)
 * Phase 2: Iteratively refine with mixed observations using learned weights
 * Phase 3: Converge to stable values
 */

// PRD Initial weights - used ONLY as fallback when no pure observations exist
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
 * Phase 1: Extract values from pure observations (single rarity only)
 */
function extractPureObservations(observations: any[]): {
  global: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } };
  byType: { [typeId: number]: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } } };
} {
  const global: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } } = {};
  const byType: { [typeId: number]: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } } } = {};

  observations.forEach((obs) => {
    const car = obs.cars;
    if (!car) return;

    const basePrice = car.base_price_min || 0;
    const baseRep = car.base_reputation || 0;
    const typeId = car.type_id;

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

    // Count parts by rarity
    const partCounts: { [key: string]: number } = {};
    parts.forEach((rarity) => {
      if (rarity && rarity !== "Stock") {
        partCounts[rarity] = (partCounts[rarity] || 0) + 1;
      }
    });

    // Only process if this is a PURE observation (single rarity)
    const rarities = Object.keys(partCounts);
    if (rarities.length === 1) {
      const rarity = rarities[0];
      const count = partCounts[rarity];
      
      const totalPriceBonus = (obs.price_min_total || 0) - basePrice;
      const totalRepBonus = (obs.rep_total || 0) - baseRep;

      const pricePerPiece = totalPriceBonus / count;
      const repPerPiece = totalRepBonus / count;

      // Add to global
      if (!global[rarity]) {
        global[rarity] = { totalPrice: 0, totalRep: 0, count: 0 };
      }
      global[rarity].totalPrice += pricePerPiece;
      global[rarity].totalRep += repPerPiece;
      global[rarity].count += 1;

      // Add to type-specific
      if (!byType[typeId]) {
        byType[typeId] = {};
      }
      if (!byType[typeId][rarity]) {
        byType[typeId][rarity] = { totalPrice: 0, totalRep: 0, count: 0 };
      }
      byType[typeId][rarity].totalPrice += pricePerPiece;
      byType[typeId][rarity].totalRep += repPerPiece;
      byType[typeId][rarity].count += 1;

      console.log(`✓ Pure observation: ${rarity} x${count} → ${Math.round(pricePerPiece)}€/piece (Type ${typeId})`);
    }
  });

  return { global, byType };
}

/**
 * Phase 2: Process mixed observations using current weights
 */
function processMixedObservations(
  observations: any[],
  currentWeights: { [typeId: number]: { [rarity: string]: number } }
): {
  byType: { [typeId: number]: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } } };
} {
  const byType: { [typeId: number]: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } } } = {};

  observations.forEach((obs) => {
    const car = obs.cars;
    if (!car) return;

    const basePrice = car.base_price_min || 0;
    const baseRep = car.base_reputation || 0;
    const typeId = car.type_id;

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

    // Count parts by rarity
    const partCounts: { [key: string]: number } = {};
    parts.forEach((rarity) => {
      if (rarity && rarity !== "Stock") {
        partCounts[rarity] = (partCounts[rarity] || 0) + 1;
      }
    });

    // Only process MIXED observations (multiple rarities)
    const rarities = Object.keys(partCounts);
    if (rarities.length > 1) {
      const totalPriceBonus = (obs.price_min_total || 0) - basePrice;
      const totalRepBonus = (obs.rep_total || 0) - baseRep;

      // Calculate total weight using current learned weights
      let totalWeight = 0;
      Object.entries(partCounts).forEach(([rarity, count]) => {
        const weight = currentWeights[typeId]?.[rarity] || PRD_WEIGHTS[rarity] || 0;
        totalWeight += weight * count;
      });

      if (totalWeight === 0) return;

      // Distribute bonuses proportionally
      Object.entries(partCounts).forEach(([rarity, count]) => {
        const weight = currentWeights[typeId]?.[rarity] || PRD_WEIGHTS[rarity] || 0;
        const proportion = (weight * count) / totalWeight;
        const priceContribution = (totalPriceBonus * proportion) / count;
        const repContribution = (totalRepBonus * proportion) / count;

        if (!byType[typeId]) {
          byType[typeId] = {};
        }
        if (!byType[typeId][rarity]) {
          byType[typeId][rarity] = { totalPrice: 0, totalRep: 0, count: 0 };
        }
        byType[typeId][rarity].totalPrice += priceContribution;
        byType[typeId][rarity].totalRep += repContribution;
        byType[typeId][rarity].count += 1;
      });
    }
  });

  return { byType };
}

/**
 * Main learning function - Iterative approach with pure observations priority
 */
export async function runLearningAlgorithm(): Promise<LearningResult> {
  console.log("🧠 Starting Learning Engine v2.0...");

  // Fetch all observations
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

  // PHASE 1: Extract pure observations
  console.log("\n=== PHASE 1: PURE OBSERVATIONS ===");
  const pureResults = extractPureObservations(observations);

  // Calculate initial weights from pure observations
  const initialWeights: { [typeId: number]: { [rarity: string]: number } } = {};
  Object.entries(pureResults.byType).forEach(([typeIdStr, rarities]) => {
    const typeId = parseInt(typeIdStr);
    initialWeights[typeId] = {};
    Object.entries(rarities).forEach(([rarity, acc]) => {
      initialWeights[typeId][rarity] = acc.totalPrice / acc.count;
    });
  });

  console.log("\nInitial weights from pure observations:");
  console.log(JSON.stringify(initialWeights, null, 2));

  // PHASE 2: Iteratively process mixed observations
  console.log("\n=== PHASE 2: MIXED OBSERVATIONS (ITERATIVE) ===");
  let currentWeights = { ...initialWeights };
  let iteration = 0;
  const maxIterations = 5;
  let converged = false;

  while (iteration < maxIterations && !converged) {
    iteration++;
    console.log(`\n--- Iteration ${iteration} ---`);

    const mixedResults = processMixedObservations(observations, currentWeights);

    // Merge pure + mixed results for this iteration
    const mergedByType: { [typeId: number]: { [rarity: string]: { totalPrice: number; totalRep: number; count: number } } } = {};

    // Start with pure observations (always trusted)
    Object.entries(pureResults.byType).forEach(([typeIdStr, rarities]) => {
      const typeId = parseInt(typeIdStr);
      mergedByType[typeId] = { ...rarities };
    });

    // Add mixed observations
    Object.entries(mixedResults.byType).forEach(([typeIdStr, rarities]) => {
      const typeId = parseInt(typeIdStr);
      if (!mergedByType[typeId]) {
        mergedByType[typeId] = {};
      }
      Object.entries(rarities).forEach(([rarity, acc]) => {
        if (mergedByType[typeId][rarity]) {
          // Combine with pure
          mergedByType[typeId][rarity].totalPrice += acc.totalPrice;
          mergedByType[typeId][rarity].totalRep += acc.totalRep;
          mergedByType[typeId][rarity].count += acc.count;
        } else {
          // New entry
          mergedByType[typeId][rarity] = { ...acc };
        }
      });
    });

    // Calculate new weights
    const newWeights: { [typeId: number]: { [rarity: string]: number } } = {};
    Object.entries(mergedByType).forEach(([typeIdStr, rarities]) => {
      const typeId = parseInt(typeIdStr);
      newWeights[typeId] = {};
      Object.entries(rarities).forEach(([rarity, acc]) => {
        newWeights[typeId][rarity] = acc.totalPrice / acc.count;
      });
    });

    // Check convergence (weights changed < 1%)
    converged = true;
    Object.entries(newWeights).forEach(([typeIdStr, rarities]) => {
      const typeId = parseInt(typeIdStr);
      Object.entries(rarities).forEach(([rarity, newValue]) => {
        const oldValue = currentWeights[typeId]?.[rarity] || 0;
        const change = Math.abs(newValue - oldValue) / Math.max(oldValue, 1);
        if (change > 0.01) {
          converged = false;
        }
      });
    });

    currentWeights = newWeights;
    console.log("Weights after iteration:", JSON.stringify(currentWeights, null, 2));
  }

  console.log(`\n✅ Converged after ${iteration} iterations`);

  // PHASE 3: Calculate final averages
  const globalWeights: { [key: string]: { avgPrice: number; avgRep: number; count: number } } = {};
  Object.entries(pureResults.global).forEach(([rarity, acc]) => {
    globalWeights[rarity] = {
      avgPrice: acc.totalPrice / acc.count,
      avgRep: acc.totalRep / acc.count,
      count: acc.count,
    };
  });

  const typeWeights: { [typeId: number]: { [rarity: string]: { avgPrice: number; avgRep: number; count: number } } } = {};
  Object.entries(currentWeights).forEach(([typeIdStr, rarities]) => {
    const typeId = parseInt(typeIdStr);
    typeWeights[typeId] = {};
    Object.entries(rarities).forEach(([rarity, avgPrice]) => {
      const acc = pureResults.byType[typeId]?.[rarity];
      typeWeights[typeId][rarity] = {
        avgPrice: avgPrice,
        avgRep: acc ? acc.totalRep / acc.count : 0,
        count: acc ? acc.count : 1,
      };
    });
  });

  console.log("\n=== FINAL RESULTS ===");
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

  // Update global part_weights (only if we have pure observations)
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