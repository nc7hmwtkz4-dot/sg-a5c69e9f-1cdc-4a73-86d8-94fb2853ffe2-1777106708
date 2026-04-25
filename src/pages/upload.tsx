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

type Rarity = "Stock" | "Gris" | "Singulière" | "Rare" | "Épique" | "Légendaire" | "Secrète";

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

const RARITIES: { name: Rarity; color: string }[] = [
  { name: "Stock", color: "bg-gray-200 hover:bg-gray-300 border-gray-400" },
  { name: "Gris", color: "bg-gray-100 hover:bg-gray-200 border-gray-300" },
  { name: "Singulière", color: "bg-green-50 hover:bg-green-100 border-green-300" },
  { name: "Rare", color: "bg-blue-50 hover:bg-blue-100 border-blue-300" },
  { name: "Épique", color: "bg-purple-50 hover:bg-purple-100 border-purple-300" },
  { name: "Légendaire", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-400" },
];

export default function UploadPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [reputation, setReputation] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [parts, setParts] = useState<Rarity[]>(Array(8).fill("Stock"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsData = await carService.getBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error("Error loading brands:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les marques",
          variant: "destructive",
        });
      }
    };
    loadBrands();
  }, []);

  const loadModels = async (brand: string) => {
    try {
      const data = await carService.getModelsByBrand(brand);
      setModels(data);
      setSelectedModel(null);
    } catch (error) {
      console.error("Error loading models:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modèles",
        variant: "destructive",
      });
    }
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    loadModels(brand);
  };

  const handleSubmit = async () => {
    if (!selectedModel || !reputation || !priceMin) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
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
        title: "✅ Contribution validée !",
        description: "Merci d'avoir contribué aux données communautaires",
      });

      setTimeout(() => {
        setSelectedBrand("");
        setSelectedModel(null);
        setReputation("");
        setPriceMin("");
        setParts(Array(8).fill("Stock"));
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'observation",
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
          <h2 className="text-2xl font-bold font-display">Merci !</h2>
          <p className="text-muted-foreground">
            Votre contribution a été ajoutée avec succès. L'algorithme d'apprentissage a mis à jour ses prédictions.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
              Ajouter une Observation
            </h1>
            <p className="text-sm text-muted-foreground">
              Contribuer aux données communautaires
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-4xl">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">Saisie Manuelle</h2>
              <p className="text-sm text-muted-foreground">
                Renseignez les caractéristiques de votre véhicule
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marque *</Label>
              <Select value={selectedBrand} onValueChange={handleBrandChange}>
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
              <Label>Modèle *</Label>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Réputation Totale *</Label>
              <Input
                type="number"
                placeholder="Ex: 22100"
                value={reputation}
                onChange={(e) => setReputation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Prix Min VM *</Label>
              <Input
                type="number"
                placeholder="Ex: 23500000"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Pièces (Cliquez pour sélectionner la rareté)</Label>
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
            {isSubmitting ? "Envoi en cours..." : "Valider & Contribuer"}
          </Button>
        </Card>

        <DonationButtons />
      </main>
    </div>
  );
}