import { supabase } from "@/integrations/supabase/client";

export const learningService = {
  async processObservation(observation: {
    carId: number;
    basePriceMin: number; // The base_price_min of the car from cars table
    observedTotalMinPrice: number;
    parts: string[]; // Array of 8 parts rarities
  }) {
    // 1. Calculate total bonus observed
    const totalBonusObserved = observation.observedTotalMinPrice - observation.basePriceMin;
    
    // 2. Identify active (non-Stock) parts
    const activeParts = observation.parts.filter(p => p !== 'Stock');
    
    if (activeParts.length === 0) return; // Nothing to learn
    
    // 3. Distribute bonus equally among active parts (simplification as per PRD)
    const individualContribution = totalBonusObserved / activeParts.length;
    
    // 4. Fetch current weights
    const uniqueRarities = [...new Set(activeParts)];
    const { data: currentWeights, error: fetchError } = await supabase
      .from('part_weights')
      .select('*')
      .in('rarity', uniqueRarities);
      
    if (fetchError) throw fetchError;
    
    // 5. Update DB using moving average formula
    for (const rarity of uniqueRarities) {
      const current = currentWeights.find(w => w.rarity === rarity);
      if (!current) continue;
      
      const count = current.observation_count || 0;
      const oldAvg = Number(current.bonus_price_min_avg) || 0;
      
      // new_avg = ((old_avg * count) + individual_contribution) / (count + 1)
      const newAvg = ((oldAvg * count) + individualContribution) / (count + 1);
      
      await supabase
        .from('part_weights')
        .update({
          bonus_price_min_avg: newAvg,
          observation_count: count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('rarity', rarity);
    }
  }
};