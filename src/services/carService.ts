import { supabase } from "@/integrations/supabase/client";

export const carService = {
  async getBrands() {
    const { data, error } = await supabase
      .from("cars")
      .select("brand")
      .order("brand");
    
    if (error) throw error;
    // Return unique brands
    return [...new Set(data.map(car => car.brand))];
  },

  async getModelsByBrand(brand: string) {
    const { data, error } = await supabase
      .from("cars")
      .select("*, car_types(*)")
      .eq("brand", brand)
      .order("model");
      
    if (error) throw error;
    return data;
  },

  async getAllCars() {
    const { data, error } = await supabase
      .from("cars")
      .select("*, car_types(*)")
      .order("brand");
      
    if (error) throw error;
    return data;
  }
};