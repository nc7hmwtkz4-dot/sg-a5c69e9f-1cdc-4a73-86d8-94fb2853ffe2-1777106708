import { useState, useCallback } from "react";
import { Upload, ArrowLeft, Check, Image as ImageIcon, Sparkles } from "lucide-react";
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
import { analyzeScreenshot } from "@/services/imageAnalysisService";

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
  const [image, setImage] = useState<string | null>(null);
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

  const loadData = async () => {
    const brandsData = await carService.getBrands();
    setBrands(brandsData);
  };

  useState(() => {
    loadData();
  });

  const loadModels = async (brand: string) => {
    const data = await carService.getModelsByBrand(brand);
    setModels(data);
    setSelectedModel(null);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    loadModels(brand);
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        
        toast({
          title: "🔍 Analyse en cours...",
          description: "Extraction automatique des données via IA",
        });
        
        try {
          const analysis = await analyzeScreenshot(dataUrl);
          
          if (analysis.confidence > 0.5) {
            // Pre-fill form with AI-extracted data
            if (analysis.brand) {
              setSelectedBrand(analysis.brand);
              await loadModels(analysis.brand);
            }
            
            if (analysis.reputation) {
              setReputation(analysis.reputation.toString());
            }
            
            if (analysis.priceMin) {
              setPriceMin(analysis.priceMin.toString());
            }
            
            if (analysis.parts) {
              setParts([
                analysis.parts.engine,
                analysis.parts.clutch,
                analysis.parts.turbo1,
                analysis.parts.turbo2,
                analysis.parts.suspension1,
                analysis.parts.suspension2,
                analysis.parts.transmission,
                analysis.parts.tires,
              ] as Rarity[]);
            }
            
            toast({
              title: "✅ Données extraites !",
              description: `Confiance: ${Math.round(analysis.confidence * 100)}% - Vérifiez avant de valider`,
            });
          } else {
            toast({
              title: "⚠️ Extraction partielle",
              description: "Veuillez compléter les données manuellement",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Analysis failed:", error);
          toast({
            title: "ℹ️ Saisie manuelle",
            description: "L'analyse automatique n'est pas disponible - complétez manuellement",
            variant: "default",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        
        toast({
          title: "🔍 Analyse en cours...",
          description: "Extraction automatique des données via IA",
        });
        
        try {
          const analysis = await analyzeScreenshot(dataUrl);
          
          if (analysis.confidence > 0.5) {
            if (analysis.brand) {
              setSelectedBrand(analysis.brand);
              await loadModels(analysis.brand);
            }
            
            if (analysis.reputation) {
              setReputation(analysis.reputation.toString());
            }
            
            if (analysis.priceMin) {
              setPriceMin(analysis.priceMin.toString());
            }
            
            if (analysis.parts) {
              setParts([
                analysis.parts.engine,
                analysis.parts.clutch,
                analysis.parts.turbo1,
                analysis.parts.turbo2,
                analysis.parts.suspension1,
                analysis.parts.suspension2,
                analysis.parts.transmission,
                analysis.parts.tires,
              ] as Rarity[]);
            }
            
            toast({
              title: "✅ Données extraites !",
              description: `Confiance: ${Math.round(analysis.confidence * 100)}% - Vérifiez avant de valider`,
            });
          } else {
            toast({
              title: "ℹ️ Saisie manuelle requise",
              description: "Complétez les informations visibles sur le screenshot",
            });
          }
        } catch (error) {
          console.error("Analysis failed:", error);
          toast({
            title: "ℹ️ Saisie manuelle",
            description: "Complétez les informations visibles sur le screenshot",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

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

      // Reset form after 2 seconds
      setTimeout(() => {
        setImage(null);
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
              Analyser un Screenshot
            </h1>
            <p className="text-sm text-muted-foreground">
              Contribuer aux données communautaires
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-4xl">
        {/* Upload Zone */}
        {!image ? (
          <Card className="p-12 border-2 border-dashed">
            <div
              className="text-center space-y-4"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display">
                  Glissez votre screenshot ici
                </h3>
                <p className="text-sm text-muted-foreground">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 L'IA analyse automatiquement votre screenshot - vérifiez et corrigez les données avant validation
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button asChild variant="outline">
                  <span>Choisir une image</span>
                </Button>
              </label>
            </div>
          </Card>
        ) : (
          <>
            {/* Image Preview */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">Aperçu</h2>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez et validez les données
                  </p>
                </div>
              </div>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img src={image} alt="Screenshot" className="w-full h-full object-contain" />
              </div>
              <Button variant="outline" size="sm" onClick={() => setImage(null)}>
                Changer l'image
              </Button>
            </Card>

            {/* Validation Form */}
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display mb-2">Validation des données</h2>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez les données extraites automatiquement
                  </p>
                </div>
                <Badge variant="default" className="gap-2 bg-accent">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs">Analyse IA</span>
                </Badge>
              </div>

              {/* Vehicle Selection */}
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

              {/* Stats */}
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

              {/* Parts Grid */}
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
          </>
        )}
      </main>
    </div>
  );
}