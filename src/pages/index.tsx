import { Calculator, Upload, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DonationButtons } from "@/components/DonationButtons";
import { StickyBottomAd } from "@/components/AdSense";

export default function Home() {
  const [stats, setStats] = useState({
    carCount: 0,
    observationCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: carCount } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true });

        const { count: observationCount } = await supabase
          .from("observations")
          .select("*", { count: "exact", head: true });

        setStats({
          carCount: carCount || 0,
          observationCount: observationCount || 0,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-primary font-display">
            OSCar Evaluation
          </h1>
          <p className="text-sm text-muted-foreground">
            Intelligence de marché automobile
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <section className="container pt-20 pb-16 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-display">
            TROUVEZ LES PRIX DE VOTRE VEHICULE
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Vous vous êtes déjà demandé si le prix que propose un vendeur est correct? Vous avez galéré en faisant des allers-retours entre le marché d'occasion et le concessionnaire pour vérifier le prix du x2? Vous avez déjà subi une arnaque à l'achat d'un véhicule? Alors cette application est faite pour vous!
          </p>
        </section>

        {/* Action Cards */}
        <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
          {/* Simulator Card */}
          <Card className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">Simulateur</CardTitle>
              </div>
              <CardDescription className="text-base">
                Estimations précises basées sur 100+ observations réelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Sélection marque & modèle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>8 sélecteurs de rareté de pièces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Prix Min, Max, Reco & x2 en temps réel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Indicateurs de confiance</span>
                </li>
              </ul>
              <Link href="/simulateur">
                <Button className="w-full group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
                  Lancer le Simulateur
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <section className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary font-display">
                  {stats.loading ? "..." : stats.carCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Véhicules Référencés
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent font-display">
                  {stats.loading ? "..." : stats.observationCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Observations Validées
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground font-display">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">
                  Open Source
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Donation Section - HIDDEN (change false to true to show) */}
        {false && (
          <section className="max-w-2xl mx-auto">
            <DonationButtons />
          </section>
        )}

        {/* How It Works */}
        <section className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold font-display">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="text-4xl">📝</div>
              <h3 className="font-bold font-display">1. Saisissez</h3>
              <p className="text-sm text-muted-foreground">
                Renseignez les caractéristiques de votre véhicule
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="text-4xl">🔄</div>
              <h3 className="font-bold font-display">2. Contribuez</h3>
              <p className="text-sm text-muted-foreground">
                Vos données enrichissent la base communautaire
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="text-4xl">📊</div>
              <h3 className="font-bold font-display">3. Simulez</h3>
              <p className="text-sm text-muted-foreground">
                Obtenez des estimations précises basées sur des données réelles
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20 pb-16 md:pb-6">
        <div className="container py-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2026 OSCar Evaluation. Alimenté par la communauté.
            </div>
            {/* Donation Buttons - HIDDEN (change false to true to show) */}
            {false && (
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  💳 PayPal
                </Button>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Ad - HIDDEN (change false to true to show) */}
      {false && <StickyBottomAd />}
    </div>
  );
}