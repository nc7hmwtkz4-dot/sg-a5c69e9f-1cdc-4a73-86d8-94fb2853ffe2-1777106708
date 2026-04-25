import { useState, useEffect } from "react";
import { Calculator, ArrowLeft, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { carService } from "@/services/carService";
import { partWeightsByTypeService } from "@/services/partWeightsByTypeService";
import { partWeightsService } from "@/services/partWeightsService";
import { useToast } from "@/hooks/use-toast";
import { HorizontalAd, SidebarAd } from "@/components/AdSense";
import { DonationButtons } from "@/components/DonationButtons";
import { supabase } from "@/integrations/supabase/client";

type Rarity = "Stock" | "Gris" | "Singuliere" | "Rare" | "Epique" | "Legendaire" | "Secrete";

interface Prices {
  min: number;
  max: number;
  reco: number;
  x2: number;
  confidence: "exact" | "high" | "medium" | "low";
  kObservations: number;
  isExactMatch?: boolean;
}

const PART_NAMES = [
  "Moteur",
  "Embrayage",
  "Turbo 1",
  "Turbo 2",
  "Suspension 1",
  "Suspension 2",
  "Transmission",
  "Pneus"
];

const RARITIES: Rarity[] = ["Stock", "Gris", "Singuliere", "Rare", "Epique", "Legendaire", "Secrete"];

export default function Simulateur() {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [parts, setParts] = useState<Rarity[]>(Array(8).fill("Stock"));
  const [prices, setPrices] = useState<any>(null);
  const [partWeights, setPartWeights] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel) {
      loadPartWeightsForCarType();
    }
  }, [selectedModel]);

  useEffect(() => {
    if (selectedModel && partWeights && Object.keys(partWeights).length > 0) {
      calculatePrices();
    }
  }, [selectedModel, parts, partWeights]);

  const loadBrands = async () => {
    const data = await carService.getBrands();
    setBrands(data);
  };

  const loadModels = async (brand: string) => {
    const data = await carService.getModelsByBrand(brand);
    setModels(data);
    setSelectedModel(null);
    setParts(Array(8).fill("Stock"));
  };

  const loadPartWeightsForCarType = async () => {
    if (!selectedModel?.car_types?.id) {
      console.log("No car type ID found");
      return;
    }
    
    console.log("Loading weights for car type:", selectedModel.car_types.name, selectedModel.car_types.id);
    
    try {
      // Try to get weights specific to this car type
      const typeSpecificWeights = await partWeightsByTypeService.getWeightsByCarType(
        selectedModel.car_types.id
      );
      
      console.log("Type-specific weights loaded:", typeSpecificWeights);
      
      // Check if we have real data
      const hasRealData = Object.values(typeSpecificWeights).some(
        (w: any) => w && w.observation_count > 0
      );
      
      console.log("Has real data:", hasRealData);
      
      if (hasRealData) {
        // Use type-specific weights, falling back to global for missing rarities
        const globalWeights = await partWeightsService.getAllWeights();
        const mergedWeights: any = {};
        
        RARITIES.forEach(rarity => {
          if (rarity === "Stock") return;
          
          if (typeSpecificWeights[rarity] && typeSpecificWeights[rarity].observation_count > 0) {
            // Use type-specific weight (real data)
            mergedWeights[rarity] = typeSpecificWeights[rarity];
          } else if (typeSpecificWeights[rarity]) {
            // Use type-specific fallback (global average)
            mergedWeights[rarity] = typeSpecificWeights[rarity];
          } else if (globalWeights[rarity]) {
            // Last resort: global weights
            mergedWeights[rarity] = globalWeights[rarity];
          }
        });
        
        console.log("Merged weights:", mergedWeights);
        setPartWeights(mergedWeights);
      } else {
        // No type-specific data, use global weights
        console.log("Using global weights");
        const globalWeights = await partWeightsService.getAllWeights();
        console.log("Global weights:", globalWeights);
        setPartWeights(globalWeights);
      }
    } catch (error) {
      console.error("Error loading weights:", error);
      // Fallback to global weights on error
      const globalWeights = await partWeightsService.getAllWeights();
      setPartWeights(globalWeights);
    }
  };

  const calculatePrices = async () => {
    console.log("calculatePrices called");
    console.log("selectedModel:", selectedModel);
    console.log("partWeights:", partWeights);
    console.log("parts:", parts);
    
    if (!selectedModel || !partWeights || Object.keys(partWeights).length === 0) {
      console.log("Missing data, cannot calculate");
      return;
    }

    console.log("Checking for exact match...");

    // FIRST: Check if this exact configuration exists in observations
    const { data: exactMatch } = await supabase
      .from("observations")
      .select("*")
      .eq("car_id", selectedModel.id)
      .eq("engine_rarity", parts[0])
      .eq("clutch_rarity", parts[1])
      .eq("turbo1_rarity", parts[2])
      .eq("turbo2_rarity", parts[3])
      .eq("suspension1_rarity", parts[4])
      .eq("suspension2_rarity", parts[5])
      .eq("transmission_rarity", parts[6])
      .eq("tires_rarity", parts[7])
      .maybeSingle();

    console.log("Exact match result:", exactMatch);

    // If exact match found, use observed values (100% confidence)
    if (exactMatch && exactMatch.price_min_total) {
      console.log("Found exact match!");
      const carType = selectedModel.car_types;
      const priceMin = exactMatch.price_min_total;
      const priceMax = priceMin + (carType?.gap_max_min || 0);
      const priceReco = priceMin + (carType?.gap_reco_min || 0);
      const priceX2 = exactMatch.price_x2 || (priceMin + (exactMatch.rep_total * (carType?.k_multiplier_avg || 2.3)));

      const result = {
        min: Math.round(priceMin),
        max: Math.round(priceMax),
        reco: Math.round(priceReco),
        x2: Math.round(priceX2),
        confidence: "exact" as const,
        kObservations: 1,
        isExactMatch: true,
      };
      
      console.log("Setting exact match prices:", result);
      setPrices(result);
      return;
    }

    console.log("No exact match, calculating from ML...");

    // Otherwise, calculate using ML algorithm
    let totalBonusRep = 0;
    let totalBonusPrice = 0;

    parts.forEach((rarity, index) => {
      if (rarity !== "Stock" && partWeights[rarity]) {
        const repBonus = partWeights[rarity].bonus_reputation_avg || 0;
        const priceBonus = partWeights[rarity].bonus_price_min_avg || 0;
        console.log(`Part ${index} (${rarity}): +${repBonus} rep, +${priceBonus} price`);
        totalBonusRep += repBonus;
        totalBonusPrice += priceBonus;
      }
    });

    console.log("Total bonuses - Rep:", totalBonusRep, "Price:", totalBonusPrice);

    const basePrice = selectedModel.base_price_min || 0;
    const baseRep = selectedModel.base_reputation || 0;
    const carType = selectedModel.car_types;

    console.log("Base values - Price:", basePrice, "Rep:", baseRep);

    const priceMin = basePrice + totalBonusPrice;
    const totalRep = baseRep + totalBonusRep;

    const priceMax = priceMin + (carType?.gap_max_min || 0);
    const priceReco = priceMin + (carType?.gap_reco_min || 0);
    
    const kMultiplier = carType?.k_multiplier_avg || 2.3;
    const priceX2 = priceMin + (totalRep * kMultiplier);

    console.log("K multiplier:", kMultiplier);

    const result = {
      min: Math.round(priceMin),
      max: Math.round(priceMax),
      reco: Math.round(priceReco),
      x2: Math.round(priceX2),
      confidence: getConfidence(partWeights),
      kObservations: carType?.k_observation_count || 0,
      isExactMatch: false,
    };

    console.log("Setting calculated prices:", result);
    setPrices(result);
  };

  const getConfidence = (weights: any): "high" | "medium" | "low" => {
    // Check if we're using type-specific weights with real observations
    const typeSpecificObs = Object.values(weights)
      .filter((w: any) => w.observation_count > 0)
      .map((w: any) => w.observation_count);
    
    if (typeSpecificObs.length > 0) {
      const avgCount = typeSpecificObs.reduce((a: number, b: number) => a + b, 0) / typeSpecificObs.length;
      if (avgCount >= 3) return "high";
      if (avgCount >= 1) return "medium";
    }
    
    // Using global weights or fallback
    return "low";
  };

  const copyToClipboard = (value: number) => {
    navigator.clipboard.writeText(value.toLocaleString("fr-FR"));
    toast({
      title: "Copié !",
      description: `${value.toLocaleString("fr-FR")} copié dans le presse-papiers`,
    });
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("fr-FR");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary font-display">
              Simulateur de Prix
            </h1>
            <p className="text-sm text-muted-foreground">
              Estimation en temps réel
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-7xl">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Configuration Card */}
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">Configuration</h2>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez votre véhicule et vos pièces
                  </p>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Marque</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une marque" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modèle</label>
                  <Select 
                    value={selectedModel?.id?.toString() || ""} 
                    onValueChange={(id) => setSelectedModel(models.find(m => m.id.toString() === id))}
                    disabled={!selectedBrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Parts Grid */}
              {selectedModel && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Pièces</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PART_NAMES.map((name, index) => (
                      <div key={name} className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">{name}</div>
                        <Select 
                          value={parts[index]} 
                          onValueChange={(value: Rarity) => {
                            const newParts = [...parts];
                            newParts[index] = value;
                            setParts(newParts);
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RARITIES.map(rarity => (
                              <SelectItem key={rarity} value={rarity}>
                                {rarity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Ad between form and results - HIDDEN (change false to true to show) */}
            {false && prices && <HorizontalAd />}

            {/* Results Card */}
            {prices && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-display">Estimations</h2>
                    <p className="text-sm text-muted-foreground">
                      {prices.isExactMatch 
                        ? "Configuration observée - Valeurs exactes" 
                        : `Modèle ${selectedModel?.car_types?.name || 'global'} - ${prices.kObservations} obs pour Prix x2`
                      }
                    </p>
                  </div>
                  <Badge variant={prices.confidence === "exact" ? "default" : prices.confidence === "high" ? "default" : prices.confidence === "medium" ? "secondary" : "destructive"} className={prices.confidence === "exact" ? "bg-green-600" : ""}>
                    {prices.confidence === "exact" ? "✓ Observation exacte" : prices.confidence === "high" ? "🟢 Haute" : prices.confidence === "medium" ? "🟡 Moyenne" : "🔴 Basse"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Prix Min", value: prices.min, color: "text-green-600" },
                    { label: "Prix Reco", value: prices.reco, color: "text-blue-600" },
                    { label: "Prix Max", value: prices.max, color: "text-purple-600" },
                    { label: "Prix x2", value: prices.x2, color: "text-orange-600" },
                  ].map(({ label, value, color }) => (
                    <Card key={label} className="p-4 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">{label}</div>
                      <div className={`text-2xl font-bold font-display ${color}`}>
                        {formatPrice(value)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => copyToClipboard(value)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copier
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Donation prompt - HIDDEN (change false to true to show) */}
            {false && prices && (
              <DonationButtons showProgressBar />
            )}
          </div>

          {/* Sidebar Ad - HIDDEN (change false to true to show) */}
          {false && <SidebarAd />}
        </div>
      </main>
    </div>
  );
}