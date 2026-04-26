import { useState, useEffect, useCallback } from "react";
import { Calculator, ArrowLeft, Copy, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { carService } from "@/services/carService";
import { partWeightsService } from "@/services/partWeightsService";
import { partWeightsByTypeService } from "@/services/partWeightsByTypeService";
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
  confidence: "exact" | "high" | "medium" | "low" | "very-low";
  observationDetails: string;
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
  const [prices, setPrices] = useState<Prices | null>(null);
  const [partWeights, setPartWeights] = useState<any>({});
  const [partWeightsByType, setPartWeightsByType] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadBrands();
    loadPartWeights();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand);
    }
  }, [selectedBrand]);

  const loadBrands = async () => {
    try {
      const data = await carService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const loadModels = async (brand: string) => {
    try {
      const data = await carService.getModelsByBrand(brand);
      setModels(data);
      setSelectedModel(null);
      setParts(Array(8).fill("Stock"));
      setPrices(null);
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const loadPartWeights = async () => {
    try {
      const weights = await partWeightsService.getAllWeights();
      const weightsByType = await partWeightsByTypeService.getAllWeightsByType();
      
      console.log("Loaded global part weights:", weights);
      console.log("Loaded type-specific weights:", weightsByType);
      
      setPartWeights(weights);
      
      // Organize weights by type for easier lookup
      // Use car_type_id directly from the database row
      const organizedByType: any = {};
      weightsByType.forEach((w: any) => {
        const typeId = w.car_type_id; // Use car_type_id directly, not nested object
        if (!organizedByType[typeId]) {
          organizedByType[typeId] = {};
        }
        organizedByType[typeId][w.part_rarity] = w;
      });
      
      console.log("Organized weights by type:", organizedByType);
      setPartWeightsByType(organizedByType);
    } catch (error) {
      console.error("Error loading part weights:", error);
    }
  };

  const calculatePrices = useCallback(async () => {
    if (!selectedModel) {
      console.log("No model selected");
      return;
    }

    if (!partWeights || Object.keys(partWeights).length === 0) {
      console.log("No part weights loaded");
      return;
    }

    console.log("Calculating prices for:", selectedModel.model);
    console.log("Parts configuration:", parts);

    // CRITICAL - INTELLIGENT MATCHING BASED ON REPUTATION
    // Calculate expected total reputation from parts configuration
    const baseRep = selectedModel.base_reputation || 0;
    let bonusRep = 0;
    
    parts.forEach((rarity) => {
      if (rarity !== "Stock" && partWeights[rarity]) {
        bonusRep += partWeights[rarity].bonus_reputation_avg || 0;
      }
    });
    
    const expectedRepTotal = Math.round(baseRep + bonusRep);
    
    console.log("Expected reputation:", expectedRepTotal);

    // Search for observation with same vehicle AND matching reputation (±50 tolerance)
    const { data: matchingObs } = await supabase
      .from("observations")
      .select("*")
      .eq("car_id", selectedModel.id)
      .gte("rep_total", expectedRepTotal - 50)
      .lte("rep_total", expectedRepTotal + 50)
      .order("rep_total", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (matchingObs && matchingObs.price_min_total && matchingObs.price_x2) {
      console.log("Found EXACT matching observation by reputation!");
      const carType = selectedModel.car_types;
      const priceMin = matchingObs.price_min_total;
      const priceMax = priceMin + (carType?.gap_max_min || 0);
      const priceReco = priceMin + (carType?.gap_reco_min || 0);
      const priceX2 = matchingObs.price_x2;

      setPrices({
        min: Math.round(priceMin),
        max: Math.round(priceMax),
        reco: Math.round(priceReco),
        x2: Math.round(priceX2),
        confidence: "exact",
        observationDetails: `Configuration observée (${matchingObs.rep_total} réputation) - Valeurs exactes`,
        isExactMatch: true,
      });
      return;
    }

    // ML estimation - use type-specific weights
    const carTypeId = selectedModel.type_id;
    const typeWeights = partWeightsByType[carTypeId] || {};
    
    console.log("Car Type ID:", carTypeId);
    console.log("Type-specific weights available:", typeWeights);
    console.log("Part configuration:", parts);
    
    let totalBonusRep = 0;
    let totalBonusPriceMin = 0;
    let totalBonusPriceX2 = 0;
    const observationCounts: { [key: string]: number } = {};
    let usedTypeSpecific = false;

    parts.forEach((rarity, index) => {
      if (rarity !== "Stock") {
        // Try type-specific weights first
        if (typeWeights[rarity]) {
          const repBonus = typeWeights[rarity].bonus_reputation_avg || 0;
          const priceMinBonus = typeWeights[rarity].bonus_price_min_avg || 0;
          const priceX2Bonus = typeWeights[rarity].bonus_price_x2_avg || 0;
          console.log(`Part ${index} (${rarity}): TYPE-SPECIFIC - Rep: +${repBonus}, Min: +${priceMinBonus}, x2: +${priceX2Bonus}`);
          totalBonusRep += repBonus;
          totalBonusPriceMin += priceMinBonus;
          totalBonusPriceX2 += priceX2Bonus;
          observationCounts[rarity] = typeWeights[rarity].observation_count || 0;
          usedTypeSpecific = true;
        } 
        // Fallback to global weights
        else if (partWeights[rarity]) {
          const repBonus = partWeights[rarity].bonus_reputation_avg || 0;
          const priceMinBonus = partWeights[rarity].bonus_price_min_avg || 0;
          const priceX2Bonus = partWeights[rarity].bonus_price_x2_avg || 0;
          console.log(`Part ${index} (${rarity}): GLOBAL - Rep: +${repBonus}, Min: +${priceMinBonus}, x2: +${priceX2Bonus}`);
          totalBonusRep += repBonus;
          totalBonusPriceMin += priceMinBonus;
          totalBonusPriceX2 += priceX2Bonus;
          observationCounts[rarity] = partWeights[rarity].observation_count || 0;
        } else {
          console.warn(`Part ${index} (${rarity}): NO WEIGHTS FOUND!`);
        }
      }
    });

    const basePrice = selectedModel.base_price_min || 0;
    const carType = selectedModel.car_types;

    const priceMin = basePrice + totalBonusPriceMin;
    const totalRep = baseRep + totalBonusRep;
    const priceMax = priceMin + (carType?.gap_max_min || 0);
    const priceReco = priceMin + (carType?.gap_reco_min || 0);
    
    // Get base x2 price from stock observation
    let basePriceX2 = 0;
    try {
      const { data: stockObs } = await supabase
        .from("observations")
        .select("price_x2")
        .eq("car_id", selectedModel.id)
        .order("rep_total", { ascending: true })
        .limit(1)
        .maybeSingle();
        
      if (stockObs && stockObs.price_x2) {
        basePriceX2 = stockObs.price_x2;
      }
    } catch (e) {
      console.error("Error fetching stock obs for x2 base", e);
    }

    // Calculate x2 using learned bonuses
    const priceX2 = basePriceX2 > 0 ? basePriceX2 + totalBonusPriceX2 : priceMin * 1.2;
    
    console.log("ML Calculation Summary:");
    console.log("- Base Price Min:", basePrice);
    console.log("- Total Bonus Price Min:", totalBonusPriceMin);
    console.log("- Final Price Min:", priceMin);
    console.log("- Base Price x2:", basePriceX2);
    console.log("- Total Bonus Price x2:", totalBonusPriceX2);
    console.log("- Final Price x2:", priceX2);
    console.log("- Base Rep:", baseRep);
    console.log("- Total Bonus Rep:", totalBonusRep);
    console.log("- Final Rep:", totalRep);
    console.log("- Used Type-Specific:", usedTypeSpecific);

    // Calculate confidence based on observation counts
    const counts = Object.values(observationCounts).filter(c => c > 0);
    const minObservations = counts.length > 0 ? Math.min(...counts) : 0;
    
    let confidence: "exact" | "high" | "medium" | "low" | "very-low";
    if (minObservations >= 10) {
      confidence = "high";
    } else if (minObservations >= 3) {
      confidence = "medium";
    } else if (minObservations >= 1) {
      confidence = "low";
    } else {
      confidence = "very-low";
    }

    // Build observation details message
    let observationDetails = "";
    if (usedTypeSpecific) {
      observationDetails = `Estimation ML (${carType?.name || "type spécifique"})`;
    } else {
      observationDetails = "Estimation ML (moyennes globales)";
    }

    const rarityLabels: { [key: string]: string } = {
      "Gris": "Gris",
      "Singuliere": "Singulières",
      "Rare": "Rares",
      "Epique": "Épiques",
      "Legendaire": "Légendaires",
      "Secrete": "Secrètes"
    };

    const obsDetails = Object.entries(observationCounts)
      .filter(([_, count]) => count > 0)
      .map(([rarity, count]) => `${count} obs ${rarityLabels[rarity] || rarity}`)
      .join(" + ");

    if (obsDetails) {
      observationDetails += ` • ${obsDetails}`;
    } else {
      observationDetails += " • Pas d'observations pour ces pièces";
    }

    console.log("ML Estimation:", {
      min: priceMin,
      max: priceMax,
      reco: priceReco,
      x2: priceX2,
      confidence,
      observationCounts,
    });

    setPrices({
      min: Math.round(priceMin),
      max: Math.round(priceMax),
      reco: Math.round(priceReco),
      x2: Math.round(priceX2),
      confidence,
      observationDetails,
      isExactMatch: false,
    });
  }, [selectedModel, parts, partWeights, partWeightsByType]);

  useEffect(() => {
    if (selectedModel && partWeights && Object.keys(partWeights).length > 0) {
      calculatePrices();
    }
  }, [selectedModel, parts, partWeights, partWeightsByType, calculatePrices]);

  const handlePartChange = (index: number, value: Rarity) => {
    const newParts = [...parts];
    newParts[index] = value;
    setParts(newParts);
  };

  const copyPrice = (price: number) => {
    navigator.clipboard.writeText(price.toLocaleString("fr-FR"));
    toast({
      title: "Prix copié !",
      description: `${price.toLocaleString("fr-FR")} € copié dans le presse-papiers`,
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fr-FR");
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "exact":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            ✓ Observation exacte
          </Badge>
        );
      case "high":
        return (
          <Badge variant="default" className="bg-green-500">
            🟢 Confiance haute
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            🟡 Confiance moyenne
          </Badge>
        );
      case "low":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            🟠 Confiance basse
          </Badge>
        );
      case "very-low":
        return (
          <Badge variant="destructive">
            🔴 Confiance très basse
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-display mb-2">Simulateur de Prix</h1>
          <p className="text-muted-foreground">Estimation en temps réel basée sur {Object.keys(partWeights).length > 0 ? "88+ observations réelles" : "..."}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">Configuration</h2>
                  <p className="text-sm text-muted-foreground">Sélectionnez votre véhicule et vos pièces</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Marque</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une marque" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Modèle</label>
                  <Select
                    value={selectedModel?.id?.toString()}
                    onValueChange={(value) => {
                      const model = models.find((m) => m.id.toString() === value);
                      setSelectedModel(model);
                    }}
                    disabled={!selectedBrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Pièces</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PART_NAMES.map((partName, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium mb-2">{partName}</label>
                      <Select value={parts[index]} onValueChange={(value) => handlePartChange(index, value as Rarity)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RARITIES.map((rarity) => (
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
            </Card>

            {prices && (
              <Card className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold font-display mb-2">Estimations</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <p>{prices.observationDetails}</p>
                    </div>
                  </div>
                  {getConfidenceBadge(prices.confidence)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-2 border-green-500/20 bg-green-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Prix Min</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(prices.min)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.min)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-blue-500/20 bg-blue-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Prix Reco</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(prices.reco)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.reco)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-purple-500/20 bg-purple-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Prix Max</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPrice(prices.max)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.max)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-orange-500/20 bg-orange-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Prix x2</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPrice(prices.x2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.x2)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </Card>
                </div>

                <HorizontalAd />
              </Card>
            )}

            <DonationButtons />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-4">
              <SidebarAd />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}