import { supabase } from "@/integrations/supabase/client";
import { normalizeRarityLabel } from "@/lib/rarity";

export const partWeightsService = {
  async getAllWeights() {
    const { data, error } = await supabase
      .from("part_weights")
      .select("*")
      .order("observation_count", { ascending: false });

    if (error) throw error;
    
    const weightsMap: Record<string, any> = {};
    if (data) {
      data.forEach((w) => {
        const rarityKey = normalizeRarityLabel(w.rarity);
        if (rarityKey) {
          weightsMap[rarityKey] = {
            ...w,
            rarity: rarityKey,
          };
        }
      });
    }
    
    return weightsMap;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("part_weights")
      .select("*")
      .order("observation_count", { ascending: false });

    if (error) throw error;
    return (data || []).map((weight) => {
      const rarityKey = normalizeRarityLabel(weight.rarity);
      return {
        ...weight,
        rarity: rarityKey || weight.rarity,
      };
    });
  },
};
