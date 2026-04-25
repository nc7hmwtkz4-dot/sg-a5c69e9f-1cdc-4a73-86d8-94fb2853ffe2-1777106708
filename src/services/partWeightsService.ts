import { supabase } from "@/integrations/supabase/client";

export const partWeightsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("part_weights")
      .select("*")
      .order("observation_count", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
