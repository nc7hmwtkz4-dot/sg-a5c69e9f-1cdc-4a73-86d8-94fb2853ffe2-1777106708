import { supabase } from "@/integrations/supabase/client";

/**
 * Learning Service - Machine Learning Algorithm
 * 
 * CRITICAL ROLE: This service implements the weighted average algorithm that learns
 * from validated observations to improve price estimations for unseen configurations.
 * 
 * TWO-LEVEL LEARNING SYSTEM:
 * 1. Global averages (part_weights): Average bonus across ALL vehicle types
 * 2. Type-specific averages (part_weights_by_type): Average bonus PER vehicle type
 *    (Rare, Singulière, Légendaire, Secrète)
 * 
 * WHY BOTH LEVELS:
 * - A "Legendaire" part on a Rare car has DIFFERENT impact than on a Secrète car
 * - Type-specific learning provides more accurate estimations
 * - Global averages serve as fallback when type-specific data is insufficient
 * 
 * ALGORITHM (per PRD):
 * 1. Extract part bonus: Total Price - Base Car Price - Other Known Parts
 * 2. Update weighted average: ((Old Bonus * Count) + New Value) / (Count + 1)
 * 
 * CRITICAL - DO NOT REMOVE OR MODIFY THIS DUAL-UPDATE LOGIC
 */

export const learningService = {
  /**
   * Process a validated observation and update BOTH learning tables
   * 
   * CRITICAL - This function MUST update both:
   * 1. part_weights (global averages)
   * 2. part_weights_by_type (type-specific averages)
   * 
   * Removing either update will break the ML estimation system
   */
  async processObservation(observationId: number): Promise<void> {
    // STEP 1: Get the observation with car details and type
    const { data: observation, error: obsError } = await supabase
      .from("observations")
      .select(`
        *,
        cars (
          base_price_min,
          base_reputation,
          type_id,
          car_types (
            id,
            name
          )
        )
      `)
      .eq("id", observationId)
      .single();

    if (obsError || !observation) {
      throw new Error("Failed to load observation");
    }

    const basePriceMin = observation.cars?.base_price_min || 0;
    const totalPriceMin = observation.price_min_total;
    const carTypeId = observation.cars?.type_id;

    if (!carTypeId) {
      throw new Error("Car type not found for this observation");
    }

    // STEP 2: Calculate total bonus from all parts
    const totalBonus = totalPriceMin - basePriceMin;

    // STEP 3: Get all non-Stock parts
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

    // STEP 4: Count each rarity type
    const rarityCount: Record<string, number> = {};
    parts.forEach(rarity => {
      rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
    });

    // STEP 5: Calculate contribution per part (simple division for now)
    const partContribution = totalBonus / parts.length;

    // CRITICAL - DO NOT REMOVE: DUAL UPDATE SYSTEM
    // Both updates are REQUIRED for the ML system to work correctly
    
    for (const [rarity, count] of Object.entries(rarityCount)) {
      // ========================================
      // UPDATE 1: GLOBAL AVERAGES (part_weights)
      // ========================================
      // CRITICAL - This provides fallback estimates when type-specific data is missing
      
      const { data: currentWeight } = await supabase
        .from("part_weights")
        .select("*")
        .eq("rarity", rarity)
        .single();

      if (currentWeight) {
        // Apply weighted average formula from PRD:
        // New Bonus = ((Old Bonus * Obs Count) + New Value) / (Obs Count + 1)
        const oldAvg = currentWeight.bonus_price_min_avg;
        const oldCount = currentWeight.observation_count;
        const newAvg = ((oldAvg * oldCount) + partContribution) / (oldCount + 1);

        await supabase
          .from("part_weights")
          .update({
            bonus_price_min_avg: newAvg,
            observation_count: oldCount + 1,
          })
          .eq("rarity", rarity);
      }

      // ===================================================
      // UPDATE 2: TYPE-SPECIFIC AVERAGES (part_weights_by_type)
      // ===================================================
      // CRITICAL - This provides accurate estimates for specific vehicle types
      // DO NOT REMOVE - Different vehicle types have different part impacts
      
      const { data: currentTypeWeight } = await supabase
        .from("part_weights_by_type")
        .select("*")
        .eq("car_type_id", carTypeId)
        .eq("part_rarity", rarity)
        .single();

      if (currentTypeWeight) {
        // Same weighted average formula, but per vehicle type
        const oldAvg = currentTypeWeight.bonus_price_min_avg;
        const oldCount = currentTypeWeight.observation_count;
        const newAvg = ((oldAvg * oldCount) + partContribution) / (oldCount + 1);

        await supabase
          .from("part_weights_by_type")
          .update({
            bonus_price_min_avg: newAvg,
            observation_count: oldCount + 1,
          })
          .eq("car_type_id", carTypeId)
          .eq("part_rarity", rarity);
      } else {
        // Create new type-specific weight entry if it doesn't exist
        await supabase
          .from("part_weights_by_type")
          .insert({
            car_type_id: carTypeId,
            part_rarity: rarity,
            bonus_price_min_avg: partContribution,
            observation_count: 1,
          });
      }
    }
  },

  /**
   * Re-run the learning algorithm on ALL existing observations
   * 
   * CRITICAL USE CASE: 
   * - After importing new observations from PDF
   * - After fixing bugs in the learning algorithm
   * - To rebuild part_weights_by_type from scratch
   * 
   * This function ensures all historical data contributes to the ML model
   */
  async retrainAllObservations(): Promise<{ processed: number; errors: number }> {
    // Reset both learning tables
    await supabase.from("part_weights").update({ 
      bonus_price_min_avg: 0, 
      observation_count: 0 
    }).neq("rarity", "");

    await supabase.from("part_weights_by_type").delete().neq("car_type_id", 0);

    // Get all observations
    const { data: observations } = await supabase
      .from("observations")
      .select("id")
      .order("id");

    if (!observations) {
      return { processed: 0, errors: 0 };
    }

    let processed = 0;
    let errors = 0;

    // Process each observation
    for (const obs of observations) {
      try {
        await this.processObservation(obs.id);
        processed++;
      } catch (error) {
        console.error(`Failed to process observation ${obs.id}:`, error);
        errors++;
      }
    }

    return { processed, errors };
  },
};