import { supabase } from "@/integrations/supabase/client";

export const carService = {
  async getBrands() {
    console.log("🔍 carService.getBrands() appelé");
    const { data, error } = await supabase
      .from("cars")
      .select("brand")
      .order("brand");
    
    console.log("📊 Résultat getBrands:", { data, error });
    if (error) {
      console.error("❌ Erreur getBrands:", error);
      throw error;
    }
    
    // Return unique brands
    const uniqueBrands = [...new Set(data.map(car => car.brand))];
    console.log("✅ Marques uniques:", uniqueBrands);
    return uniqueBrands;
  },

  async getModelsByBrand(brand: string) {
    console.log("🔍 carService.getModelsByBrand() appelé avec brand:", brand);
    const { data, error } = await supabase
      .from("cars")
      .select("*, car_types(*)")
      .eq("brand", brand)
      .order("model");
    
    console.log("📊 Résultat getModelsByBrand:", { data, error });
    if (error) {
      console.error("❌ Erreur getModelsByBrand:", error);
      throw error;
    }
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