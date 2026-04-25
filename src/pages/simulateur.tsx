import { useState, useEffect, useCallback } from "react";
import { Calculator, ArrowLeft, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { carService } from "@/services/carService";
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
  const [prices, setPrices] = useState<Prices | null>(null);
  const [partWeights, setPartWeights] = useState<any>({});
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
      console.log("Loaded part weights:", weights);
      setPartWeights(weights);
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

    // Check for exact observation match
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

    if (exactMatch && exactMatch.price_min_total) {
      console.log("Found exact observation match!");
      const carType = selectedModel.car_types;
      const priceMin = exactMatch.price_min_total;
      const priceMax = priceMin + (carType?.gap_max_min || 0);
      const priceReco = priceMin + (carType?.gap_reco_min || 0);
      const priceX2 = exactMatch.price_x2 || (priceMin + (exactMatch.rep_total * (carType?.k_multiplier_avg || 2.3)));

      setPrices({
        min: Math.round(priceMin),
        max: Math.round(priceMax),
        reco: Math.round(priceReco),
        x2: Math.round(priceX2),
        confidence: "exact",
        kObservations: 1,
        isExactMatch: true,
      });
      return;
    }

    // Calculate using ML weights
    let totalBonusRep = 0;
    let totalBonusPrice = 0;

    parts.forEach((rarity) => {
      if (rarity !== "Stock" && partWeights[rarity]) {
        totalBonusRep += partWeights[rarity].bonus_reputation_avg || 0;
        totalBonusPrice += partWeights[rarity].bonus_price_min_avg || 0;
      }
    });

    const basePrice = selectedModel.base_price_min || 0;
    const baseRep = selectedModel.base_reputation || 0;
    const carType = selectedModel.car_types;

    const priceMin = basePrice + totalBonusPrice;
    const totalRep = baseRep + totalBonusRep;
    const priceMax = priceMin + (carType?.gap_max_min || 0);
    const priceReco = priceMin + (carType?.gap_reco_min || 0);
    const kMultiplier = carType?.k_multiplier_avg || 2.3;
    const priceX2 = priceMin + (totalRep * kMultiplier);

    const weightsArray = Object.values(partWeights) as any[];
    const validWeights = weightsArray.filter(w => w && w.observation_count > 0);
    const totalObs = validWeights.reduce((sum: number, w: any) => sum + (Number(w.observation_count) || 0), 0);
    const avgObservations = weightsArray.length > 0 ? totalObs / weightsArray.length : 0;

    const confidence = avgObservations >= 3 ? "high" : avgObservations >= 1 ? "medium" : "low";

    console.log("Calculated prices:", {
      min: priceMin,
      max: priceMax,
      reco: priceReco,
      x2: priceX2,
    });

    setPrices({
      min: Math.round(priceMin),
      max: Math.round(priceMax),
      reco: Math.round(priceReco),
      x2: Math.round(priceX2),
      confidence,
      kObservations: carType?.k_observation_count || 0,
      isExactMatch: false,
    });
  }, [selectedModel, parts, partWeights]);

  useEffect(() => {
    if (selectedModel && partWeights && Object.keys(partWeights).length > 0) {
      calculatePrices();
    }
  }, [selectedModel, parts, partWeights, calculatePrices]);

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
          <p className="text-muted-foreground">Estimation en temps réel</p>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-display">Estimations</h2>
                    <p className="text-sm text-muted-foreground">
                      {prices.isExactMatch
                        ? "Configuration observée - Valeurs exactes"
                        : `Basées sur les observations (Prix x2: ${prices.kObservations} obs)`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      prices.confidence === "exact"
                        ? "default"
                        : prices.confidence === "high"
                        ? "default"
                        : prices.confidence === "medium"
                        ? "secondary"
                        : "destructive"
                    }
                    className={prices.confidence === "exact" ? "bg-green-600" : ""}
                  >
                    {prices.confidence === "exact"
                      ? "✓ Observation exacte"
                      : prices.confidence === "high"
                      ? "🟢 Haute"
                      : prices.confidence === "medium"
                      ? "🟡 Moyenne"
                      : "🔴 Basse"}
                  </Badge>
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