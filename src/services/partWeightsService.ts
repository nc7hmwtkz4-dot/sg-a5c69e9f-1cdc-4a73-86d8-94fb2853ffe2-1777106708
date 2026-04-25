import { supabase } from "@/integrations/supabase/client";

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
        weightsMap[w.rarity] = w;
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
    return data || [];
  },
};
