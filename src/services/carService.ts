import { supabase } from "@/integrations/supabase/client";

export const carService = {
  async getBrands() {
    const { data, error } = await supabase
      .from("cars")
      .select("brand")
      .order("brand");

    if (error) throw error;

    const uniqueBrands = [...new Set(data?.map(c => c.brand) || [])];
    return uniqueBrands;
  },

  async getModelsByBrand(brand: string) {
    const { data, error } = await supabase
      .from("cars")
      .select(`
        *,
        car_types (
          name,
          gap_max_min,
          gap_reco_min,
          k_multiplier_avg,
          k_observation_count
        )
      `)
      .eq("brand", brand)
      .order("model");

    if (error) throw error;
    return data || [];
  },
};