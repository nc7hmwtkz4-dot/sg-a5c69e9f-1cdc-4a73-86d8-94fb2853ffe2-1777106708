import { supabase } from "@/integrations/supabase/client";

/**
 * Learning Service - Implements the weighted average algorithm from PRD
 * 
 * When a new observation is validated:
 * 1. Extract part bonus: Total Price - Base Car Price - Other Known Parts
 * 2. Update weighted average: ((Old Bonus * Count) + New Value) / (Count + 1)
 */

export const learningService = {
  /**
   * Process a validated observation and update part_weights
   * This is the core learning algorithm from the PRD
   */
  async processObservation(observationId: number): Promise<void> {
    // Get the observation with car details
    const { data: observation, error: obsError } = await supabase
      .from("observations")
      .select(`
        *,
        cars (
          base_price_min,
          base_reputation
        )
      `)
      .eq("id", observationId)
      .single();

    if (obsError || !observation) {
      throw new Error("Failed to load observation");
    }

    const basePriceMin = observation.cars?.base_price_min || 0;
    const totalPriceMin = observation.price_min_total;

    // Calculate total bonus from all parts
    const totalBonus = totalPriceMin - basePriceMin;

    // Get all non-Stock parts
    const parts = [
      observation.engine_rarity,
      observation.clutch_rarity,
      observation.turbo1_rarity,
      observation.turbo2_rarity,
      observation.suspension1_rarity,
      observation.suspension2_rarity,
      observation.transmission_rarity,
      observation.tires_rarity,
    ].filter(p => p !== "Stock");

    if (parts.length === 0) {
      // Stock configuration, nothing to learn
      return;
    }

    // Count each rarity type
    const rarityCount: Record<string, number> = {};
    parts.forEach(rarity => {
      rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
    });

    // For each unique rarity, update its weight
    for (const [rarity, count] of Object.entries(rarityCount)) {
      // Get current weight
      const { data: currentWeight } = await supabase
        .from("part_weights")
        .select("*")
        .eq("rarity", rarity)
        .single();

      if (!currentWeight) continue;

      // Calculate this part's contribution (simple division for now)
      const partContribution = totalBonus / parts.length;

      // Apply weighted average formula from PRD:
      // New Bonus = ((Old Bonus * Obs Count) + New Value) / (Obs Count + 1)
      const oldAvg = currentWeight.bonus_price_min_avg;
      const oldCount = currentWeight.observation_count;
      const newAvg = ((oldAvg * oldCount) + partContribution) / (oldCount + 1);

      // Update the weight
      await supabase
        .from("part_weights")
        .update({
          bonus_price_min_avg: newAvg,
          observation_count: oldCount + 1,
        })
        .eq("rarity", rarity);
    }
  },
};