import { useState, useEffect } from "react";
import { ArrowLeft, Check, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { carService } from "@/services/carService";
import { observationService } from "@/services/observationService";
import { useToast } from "@/hooks/use-toast";
import { DonationButtons } from "@/components/DonationButtons";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

type Rarity = "Stock" | "Gris" | "Singulière" | "Rare" | "Épique" | "Légendaire" | "Secrète";

const RARITIES: { name: Rarity; color: string }[] = [
  { name: "Stock", color: "bg-gray-200 hover:bg-gray-300 border-gray-400" },
  { name: "Gris", color: "bg-gray-100 hover:bg-gray-200 border-gray-300" },
  { name: "Singulière", color: "bg-green-50 hover:bg-green-100 border-green-300" },
  { name: "Rare", color: "bg-blue-50 hover:bg-blue-100 border-blue-300" },
  { name: "Épique", color: "bg-purple-50 hover:bg-purple-100 border-purple-300" },
  { name: "Légendaire", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-400" },
];

export default function UploadPage() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [reputation, setReputation] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceX2, setPriceX2] = useState<string>("");
  const [parts, setParts] = useState<Rarity[]>(Array(8).fill("Stock"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
    console.log("🚀 Composant UploadPage monté, chargement des marques...");
    const loadBrands = async () => {
      try {
        const brandsData = await carService.getBrands();
        console.log("✅ Marques chargées:", brandsData);
        setBrands(brandsData);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des marques:", error);
        toast({
          title: t("upload.error.submit"),
          description: t("upload.error.brands"),
          variant: "destructive",
        });
      }
    };
    loadBrands();
  }, [toast, t]);

  const loadModels = async (brand: string) => {
    console.log("🔄 Chargement des modèles pour la marque:", brand);
    try {
      const data = await carService.getModelsByBrand(brand);
      console.log("✅ Modèles chargés:", data);
      setModels(data);
      setSelectedModel(null);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des modèles:", error);
      toast({
        title: t("upload.error.submit"),
        description: t("upload.error.models"),
        variant: "destructive",
      });
    }
  };

  const handleBrandChange = (brand: string) => {
    console.log("🎯 Marque sélectionnée:", brand);
    setSelectedBrand(brand);
    loadModels(brand);
  };

  const handleSubmit = async () => {
    if (!selectedModel || !reputation || !priceMin || !priceX2) {
      toast({
        title: t("upload.error.missing"),
        description: t("upload.error.missing.desc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await observationService.submitObservation({
        car_id: selectedModel.id,
        rep_total: parseInt(reputation),
        price_min_total: parseInt(priceMin),
        price_x2: parseInt(priceX2),
        engine_rarity: parts[0],
        clutch_rarity: parts[1],
        turbo1_rarity: parts[2],
        turbo2_rarity: parts[3],
        suspension1_rarity: parts[4],
        suspension2_rarity: parts[5],
        transmission_rarity: parts[6],
        tires_rarity: parts[7],
        base_price_min: selectedModel.base_price_min || 0
      });

      setShowSuccess(true);
      toast({
        title: t("upload.toast.validated"),
        description: t("upload.toast.validated.desc"),
      });

      setTimeout(() => {
        setSelectedBrand("");
        setSelectedModel(null);
        setReputation("");
        setPriceMin("");
        setPriceX2("");
        setParts(Array(8).fill("Stock"));
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      toast({
        title: t("upload.error.submit"),
        description: t("upload.error.submit.desc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold font-display">{t("upload.success.title")}</h2>
          <p className="text-muted-foreground">
            {t("upload.success.message")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("upload.back")}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary font-display">
                {t("upload.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("upload.subtitle")}
              </p>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-4xl">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">{t("upload.form.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("upload.form.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("upload.brand")} *</Label>
              <Select value={selectedBrand} onValueChange={handleBrandChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("upload.brand.placeholder")} />
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
              <Label>{t("upload.model")} *</Label>
              <Select 
                value={selectedModel?.id?.toString() || ""} 
                onValueChange={(id) => setSelectedModel(models.find(m => m.id.toString() === id))}
                disabled={!selectedBrand}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("upload.model.placeholder")} />
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("upload.reputation")} *</Label>
              <Input
                type="number"
                placeholder={t("upload.reputation.placeholder")}
                value={reputation}
                onChange={(e) => setReputation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("upload.price.min")} *</Label>
              <Input
                type="number"
                placeholder={t("upload.price.min.placeholder")}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("upload.price.x2")} *</Label>
            <Input
              type="number"
              placeholder={t("upload.price.x2.placeholder")}
              value={priceX2}
              onChange={(e) => setPriceX2(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("upload.price.x2.hint")}
            </p>
          </div>

          <div className="space-y-3">
            <Label>{t("upload.parts")}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PART_NAMES.map((name, index) => (
                <div key={name} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">{name}</div>
                  <div className="grid grid-cols-2 gap-1">
                    {RARITIES.map(({ name: rarity, color }) => (
                      <button
                        key={rarity}
                        type="button"
                        onClick={() => {
                          const newParts = [...parts];
                          newParts[index] = rarity;
                          setParts(newParts);
                        }}
                        className={`p-2 rounded border-2 text-xs font-semibold transition-all ${color} ${
                          parts[index] === rarity ? "ring-2 ring-primary" : "opacity-50"
                        }`}
                      >
                        {rarity === "Stock" ? "S" : rarity[0]}
                      </button>
                    ))}
                  </div>
                  {parts[index] !== "Stock" && (
                    <Badge variant="outline" className="text-xs w-full justify-center">
                      {parts[index]}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? t("upload.submitting") : t("upload.submit")}
          </Button>
        </Card>

        {/* Donation Buttons - HIDDEN (change false to true to show) */}
        {false && <DonationButtons />}
      </main>
    </div>
  );
}