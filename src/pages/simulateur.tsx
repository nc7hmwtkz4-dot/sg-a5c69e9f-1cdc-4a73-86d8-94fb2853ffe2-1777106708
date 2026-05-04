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
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

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

const RARITIES: Rarity[] = ["Stock", "Gris", "Singuliere", "Rare", "Epique", "Legendaire", "Secrete"];

const OBSERVATION_PART_FIELDS = [
  "engine_rarity",
  "clutch_rarity",
  "turbo1_rarity",
  "turbo2_rarity",
  "suspension1_rarity",
  "suspension2_rarity",
  "transmission_rarity",
  "tires_rarity"
] as const;

type ObservationPartField = (typeof OBSERVATION_PART_FIELDS)[number];

interface ObservationMatch {
  rep_total: number;
  price_min_total: number | null;
  price_x2: number | null;
  price_max?: number | null;
  price_reco?: number | null;
  [key: string]: string | number | null | undefined;
}

const MIN_TYPE_OBSERVATIONS = 2;
const MIN_GLOBAL_OBSERVATIONS = 3;

const isStockObservation = (observation: Partial<Record<ObservationPartField, string | null>>) => {
  return OBSERVATION_PART_FIELDS.every((field) => {
    const rarity = observation[field];
    return rarity === null || rarity === "Stock";
  });
};

const getClosestObservation = <T extends { rep_total: number }>(observations: T[], targetRep: number): T | null => {
  return observations.reduce<T | null>((closest, current) => {
    if (!closest) {
      return current;
    }

    const currentDiff = Math.abs(current.rep_total - targetRep);
    const closestDiff = Math.abs(closest.rep_total - targetRep);

    if (currentDiff < closestDiff) {
      return current;
    }

    if (currentDiff === closestDiff && current.rep_total < closest.rep_total) {
      return current;
    }

    return closest;
  }, null);
};

// Helper function to get color class for each rarity
const getRarityColorClass = (rarity: Rarity): string => {
  switch (rarity) {
    case "Gris":
      return "bg-gray-700 text-gray-200";
    case "Singuliere":
      return "bg-green-700 text-green-100";
    case "Rare":
      return "bg-blue-700 text-blue-100";
    case "Epique":
      return "bg-purple-700 text-purple-100";
    case "Legendaire":
      return "bg-yellow-700 text-yellow-100";
    case "Secrete":
      return "bg-red-700 text-red-100";
    default:
      return ""; // Stock - no special color
  }
};

const getStockBasePriceX2 = async (carId: number) => {
  const { data, error } = await supabase
    .from("observations")
    .select("price_x2, rep_total, engine_rarity, clutch_rarity, turbo1_rarity, turbo2_rarity, suspension1_rarity, suspension2_rarity, transmission_rarity, tires_rarity")
    .eq("car_id", carId)
    .order("rep_total", { ascending: true });

  if (error) {
    throw error;
  }

  const stockObservation = (data || []).find((observation) => isStockObservation(observation));
  return stockObservation?.price_x2 || 0;
};

export default function Simulateur() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [parts, setParts] = useState<Rarity[]>(Array(8).fill("Stock"));
  const [prices, setPrices] = useState<Prices | null>(null);
  const [partWeights, setPartWeights] = useState<any>({});
  const [partWeightsByType, setPartWeightsByType] = useState<any>({});
  const { toast } = useToast();

  const PART_NAMES = [
    t("simulator.parts.engine"),
    t("simulator.parts.clutch"),
    t("simulator.parts.turbo1"),
    t("simulator.parts.turbo2"),
    t("simulator.parts.suspension1"),
    t("simulator.parts.suspension2"),
    t("simulator.parts.transmission"),
    t("simulator.parts.tires")
  ];

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
      
      const organizedByType: any = {};
      weightsByType.forEach((w: any) => {
        const typeId = w.car_type_id;
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

  const resolveWeight = useCallback((carTypeId: number | null | undefined, rarity: Rarity) => {
    if (!carTypeId || rarity === "Stock") {
      return null;
    }

    const typeWeight = partWeightsByType[carTypeId]?.[rarity];
    const globalWeight = partWeights[rarity];
    const typeObservationCount = typeWeight?.observation_count || 0;
    const globalObservationCount = globalWeight?.observation_count || 0;

    if (typeWeight && typeObservationCount >= MIN_TYPE_OBSERVATIONS) {
      return {
        weight: typeWeight,
        source: "type",
      };
    }

    if (globalWeight && globalObservationCount >= MIN_GLOBAL_OBSERVATIONS) {
      return {
        weight: globalWeight,
        source: "global",
      };
    }

    return null;
  }, [partWeights, partWeightsByType]);

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

    const carTypeId = selectedModel.type_id;
    const baseRep = selectedModel.base_reputation || 0;
    let bonusRep = 0;
    
    parts.forEach((rarity) => {
      const resolvedWeight = resolveWeight(carTypeId, rarity);
      if (resolvedWeight) {
        bonusRep += resolvedWeight.weight.bonus_reputation_avg || 0;
      }
    });
    
    const expectedRepTotal = Math.round(baseRep + bonusRep);
    
    console.log("Expected reputation:", expectedRepTotal);

    const { data: matchingObsCandidates, error: matchingObsError } = await supabase
      .from("observations")
      .select("*")
      .eq("car_id", selectedModel.id)
      .gte("rep_total", expectedRepTotal - 50)
      .lte("rep_total", expectedRepTotal + 50);

    if (matchingObsError) {
      console.error("Error loading exact observation:", matchingObsError);
    }

    const matchingObs = getClosestObservation<ObservationMatch>(matchingObsCandidates || [], expectedRepTotal);

    if (matchingObs && matchingObs.price_min_total && matchingObs.price_x2) {
      console.log("Found EXACT matching observation by reputation!");
      const carType = selectedModel.car_types;
      const priceMin = matchingObs.price_min_total;
      
      const priceMax = matchingObs.price_max || (priceMin + (carType?.gap_max_min || 0));
      const priceReco = matchingObs.price_reco || (priceMin + (carType?.gap_reco_min || 0));
      
      let basePriceX2 = 0;
      try {
        basePriceX2 = await getStockBasePriceX2(selectedModel.id);
      } catch (e) {
        console.error("Error fetching stock obs for x2 base", e);
      }
      
      let totalBonusPriceX2 = 0;
      
      parts.forEach((rarity) => {
        const resolvedWeight = resolveWeight(carTypeId, rarity);
        if (resolvedWeight) {
          totalBonusPriceX2 += resolvedWeight.weight.bonus_price_x2_avg || 0;
        }
      });
      
      const basePriceX2Stock = basePriceX2 > 0 ? basePriceX2 : (priceMin * (carType?.k_multiplier_avg || 1.0));
      const priceX2 = basePriceX2Stock + totalBonusPriceX2;

      setPrices({
        min: Math.round(priceMin),
        max: Math.round(priceMax),
        reco: Math.round(priceReco),
        x2: Math.round(priceX2),
        confidence: "exact",
        observationDetails: `${t("simulator.observation.exact")} (${matchingObs.rep_total} ${t("simulator.observation.exact.suffix")})`,
        isExactMatch: true,
      });
      return;
    }

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
      const resolvedWeight = resolveWeight(carTypeId, rarity);

      if (resolvedWeight) {
        const repBonus = resolvedWeight.weight.bonus_reputation_avg || 0;
        const priceMinBonus = resolvedWeight.weight.bonus_price_min_avg || 0;
        const priceX2Bonus = resolvedWeight.weight.bonus_price_x2_avg || 0;

        console.log(`Part ${index} (${rarity}): ${resolvedWeight.source.toUpperCase()} - Rep: +${repBonus}, Min: +${priceMinBonus}, x2: +${priceX2Bonus}`);

        totalBonusRep += repBonus;
        totalBonusPriceMin += priceMinBonus;
        totalBonusPriceX2 += priceX2Bonus;
        observationCounts[rarity] = resolvedWeight.weight.observation_count || 0;
        usedTypeSpecific = usedTypeSpecific || resolvedWeight.source === "type";
      } else if (rarity !== "Stock") {
        console.warn(`Part ${index} (${rarity}): NO WEIGHTS FOUND!`);
      }
    });

    const basePrice = selectedModel.base_price_min || 0;
    const carType = selectedModel.car_types;

    const priceMin = basePrice + totalBonusPriceMin;
    const totalRep = baseRep + totalBonusRep;
    const priceMax = priceMin + (carType?.gap_max_min || 0);
    const priceReco = priceMin + (carType?.gap_reco_min || 0);
    
    let basePriceX2 = 0;
    try {
      console.log("Fetching stock observation for car_id:", selectedModel.id, "model:", selectedModel.model);
      basePriceX2 = await getStockBasePriceX2(selectedModel.id);

      if (basePriceX2 > 0) {
        console.log("Found base price x2 from stock observation:", basePriceX2);
      } else {
        console.log("No stock observation with price_x2 found, will use K multiplier fallback");
      }
    } catch (e) {
      console.error("Error fetching stock obs for x2 base", e);
    }

    const basePriceX2Stock = basePriceX2 > 0 ? basePriceX2 : (basePrice * (carType?.k_multiplier_avg || 2.3));
    const priceX2 = basePriceX2Stock + totalBonusPriceX2;
    
    console.log("ML Calculation Summary:");
    console.log("- Base Price Min:", basePrice);
    console.log("- Total Bonus Price Min:", totalBonusPriceMin);
    console.log("- Final Price Min:", priceMin);
    console.log("- Base Price x2 (stock):", basePriceX2Stock);
    console.log("- K Multiplier:", carType?.k_multiplier_avg || 2.3);
    console.log("- Total Bonus Price x2:", totalBonusPriceX2);
    console.log("- Final Price x2:", priceX2);
    console.log("- Base Rep:", baseRep);
    console.log("- Total Bonus Rep:", totalBonusRep);
    console.log("- Final Rep:", totalRep);
    console.log("- Used Type-Specific:", usedTypeSpecific);

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

    let observationDetails = "";
    if (usedTypeSpecific) {
      observationDetails = `${t("simulator.observation.ml.specific")} (${carType?.name || "type spécifique"})`;
    } else {
      observationDetails = t("simulator.observation.ml.global");
    }

    const rarityLabels: { [key: string]: string } = {
      "Gris": t("rarity.plural.Gris"),
      "Singuliere": t("rarity.plural.Singuliere"),
      "Rare": t("rarity.plural.Rare"),
      "Epique": t("rarity.plural.Epique"),
      "Legendaire": t("rarity.plural.Legendaire"),
      "Secrete": t("rarity.plural.Secrete")
    };

    const obsDetails = Object.entries(observationCounts)
      .filter(([_, count]) => count > 0)
      .map(([rarity, count]) => `${count} ${t("simulator.observation.obs")} ${rarityLabels[rarity] || rarity}`)
      .join(" + ");

    if (obsDetails) {
      observationDetails += ` • ${obsDetails}`;
    } else {
      observationDetails += ` • ${t("simulator.observation.nodata")}`;
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
  }, [selectedModel, parts, partWeights, partWeightsByType, t, resolveWeight]);

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
      title: t("simulator.copied.title"),
      description: `${price.toLocaleString("fr-FR")} € ${t("simulator.copied.description")}`,
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
            {t("simulator.confidence.exact")}
          </Badge>
        );
      case "high":
        return (
          <Badge variant="default" className="bg-green-500">
            {t("simulator.confidence.high")}
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            {t("simulator.confidence.medium")}
          </Badge>
        );
      case "low":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            {t("simulator.confidence.low")}
          </Badge>
        );
      case "very-low":
        return (
          <Badge variant="destructive">
            {t("simulator.confidence.verylow")}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("simulator.back")}
              </Button>
            </Link>
            <h1 className="text-4xl font-bold font-display mb-2">{t("simulator.title")}</h1>
            <p className="text-muted-foreground">{t("simulator.subtitle")}</p>
          </div>
          <LanguageSelector />
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">{t("simulator.configuration")}</h2>
                  <p className="text-sm text-muted-foreground">{t("simulator.configuration.subtitle")}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("simulator.brand")}</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("simulator.brand.placeholder")} />
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
                  <label className="block text-sm font-medium mb-2">{t("simulator.model")}</label>
                  <Select
                    value={selectedModel?.id?.toString()}
                    onValueChange={(value) => {
                      const model = models.find((m) => m.id.toString() === value);
                      setSelectedModel(model);
                    }}
                    disabled={!selectedBrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("simulator.model.placeholder")} />
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
                <h3 className="font-medium mb-4">{t("simulator.parts")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PART_NAMES.map((partName, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium mb-2">{partName}</label>
                      <Select value={parts[index]} onValueChange={(value) => handlePartChange(index, value as Rarity)}>
                        <SelectTrigger className={getRarityColorClass(parts[index])}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RARITIES.map((rarity) => (
                            <SelectItem 
                              key={rarity} 
                              value={rarity}
                              className={getRarityColorClass(rarity)}
                            >
                              {t(`rarity.${rarity}`)}
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
                    <h2 className="text-xl font-bold font-display mb-2">{t("simulator.estimates.title")}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <p>{prices.observationDetails}</p>
                    </div>
                  </div>
                  {getConfidenceBadge(prices.confidence)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-2 border-green-500/20 bg-green-500/5">
                    <p className="text-sm text-muted-foreground mb-1">{t("simulator.estimates.min")}</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(prices.min)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.min)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("simulator.copy")}
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-blue-500/20 bg-blue-500/5">
                    <p className="text-sm text-muted-foreground mb-1">{t("simulator.estimates.reco")}</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(prices.reco)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.reco)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("simulator.copy")}
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-purple-500/20 bg-purple-500/5">
                    <p className="text-sm text-muted-foreground mb-1">{t("simulator.estimates.max")}</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPrice(prices.max)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.max)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("simulator.copy")}
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-orange-500/20 bg-orange-500/5">
                    <p className="text-sm text-muted-foreground mb-1">{t("simulator.estimates.x2")}</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPrice(prices.x2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrice(prices.x2)}
                      className="mt-2 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("simulator.copy")}
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