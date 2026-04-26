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
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Simulator Card */}
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground font-display">
                Calculer un Prix
              </h3>
              <p className="text-muted-foreground">
                Sélectionnez votre véhicule et configurez vos pièces pour obtenir une estimation en temps réel des prix Min, Max, Reco et x2.
              </p>
            </div>
            <Link href="/simulateur">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Ouvrir le Simulateur
              </Button>
            </Link>
          </Card>

          {/* Upload Card */}
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground font-display">
                Ajouter une Observation
              </h3>
              <p className="text-muted-foreground">
                Saisissez manuellement les caractéristiques de votre véhicule pour contribuer aux données communautaires.
              </p>
            </div>
            <Link href="/upload">
              <Button className="w-full" variant="outline">
                Saisir une Observation
              </Button>
            </Link>
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