import { supabase } from "@/integrations/supabase/client";
import { learningService } from "./learningService";

export const observationService = {
  async submitObservation(data: {
    car_id: number;
    rep_total: number;
    price_min_total: number;
    engine_rarity: string;
    clutch_rarity: string;
    turbo1_rarity: string;
    turbo2_rarity: string;
    suspension1_rarity: string;
    suspension2_rarity: string;
    transmission_rarity: string;
    tires_rarity: string;
    base_price_min: number;
  }) {
    // 1. Save observation
    const { data: obs, error: obsError } = await supabase
      .from('observations')
      .insert({
        car_id: data.car_id,
        rep_total: data.rep_total,
        price_min_total: data.price_min_total,
        engine_rarity: data.engine_rarity,
        clutch_rarity: data.clutch_rarity,
        turbo1_rarity: data.turbo1_rarity,
        turbo2_rarity: data.turbo2_rarity,
        suspension1_rarity: data.suspension1_rarity,
        suspension2_rarity: data.suspension2_rarity,
        transmission_rarity: data.transmission_rarity,
        tires_rarity: data.tires_rarity
      })
      .select()
      .single();
      
    if (obsError) throw obsError;
    
    // 2. Trigger learning algorithm
    const parts = [
      data.engine_rarity,
      data.clutch_rarity,
      data.turbo1_rarity,
      data.turbo2_rarity,
      data.suspension1_rarity,
      data.suspension2_rarity,
      data.transmission_rarity,
      data.tires_rarity
    ];
    
    if (data.base_price_min) {
      await learningService.processObservation(obs.id);
    }
    
    return obs;
  }
};