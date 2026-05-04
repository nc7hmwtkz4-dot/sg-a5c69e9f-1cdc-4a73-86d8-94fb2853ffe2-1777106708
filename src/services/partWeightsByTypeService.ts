import { supabase } from "@/integrations/supabase/client";
import { normalizeRarityLabel } from "@/lib/rarity";

export const partWeightsByTypeService = {
  /**
   * Get part weights specific to a car type
   * Falls back to global weights if no specific data available
   */
  async getWeightsByCarType(carTypeId: number) {
    const { data, error } = await supabase
      .from("part_weights_by_type")
      .select("*")
      .eq("car_type_id", carTypeId);

    if (error) throw error;
    
    // Convert to map indexed by rarity
    const weightsMap: Record<string, any> = {};
    if (data) {
      data.forEach((w) => {
        const rarityKey = normalizeRarityLabel(w.part_rarity);
        if (rarityKey) {
          weightsMap[rarityKey] = {
            ...w,
            part_rarity: rarityKey,
          };
        }
      });
    }
    
    return weightsMap;
  },

  /**
   * Get all part weights organized by car type
   */
  async getAllWeightsByType() {
    const { data, error } = await supabase
      .from("part_weights_by_type")
      .select(`
        *,
        car_types (
          id,
          name
        )
      `)
      .order("car_type_id")
      .order("observation_count", { ascending: false });

    if (error) throw error;
    return (data || []).map((weight) => {
      const rarityKey = normalizeRarityLabel(weight.part_rarity);
      return {
        ...weight,
        part_rarity: rarityKey || weight.part_rarity,
      };
    });
  },
};