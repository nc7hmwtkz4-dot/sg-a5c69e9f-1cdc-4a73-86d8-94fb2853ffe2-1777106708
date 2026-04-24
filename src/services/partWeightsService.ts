import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PartWeight = Database["public"]["Tables"]["part_weights"]["Row"];

export const partWeightsService = {
  async getAllWeights() {
    const { data, error } = await supabase
      .from("part_weights")
      .select("*");
      
    if (error) throw error;
    return data.reduce((acc, curr) => {
      acc[curr.rarity] = curr;
      return acc;
    }, {} as Record<string, PartWeight>);
  }
};