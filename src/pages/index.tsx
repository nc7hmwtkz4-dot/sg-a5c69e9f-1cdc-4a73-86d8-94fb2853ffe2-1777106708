import { Calculator, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-primary font-display">
            Eco-Sim
          </h1>
          <p className="text-sm text-muted-foreground">
            Automotive Market Intelligence
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground font-display">
            Prix Précis, Données Communautaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plateforme d'intelligence de marché alimentée par l'IA qui apprend de chaque observation pour fournir les estimations les plus précises.
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
                Analyser un Screenshot
              </h3>
              <p className="text-muted-foreground">
                Envoyez une capture d'écran de votre véhicule pour contribuer aux données et améliorer la précision du système.
              </p>
            </div>
            <Link href="/upload">
              <Button className="w-full" variant="outline">
                Télécharger une Image
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
                  5
                </div>
                <div className="text-sm text-muted-foreground">
                  Véhicules Référencés
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent font-display">
                  0
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

        {/* How It Works */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center text-foreground font-display">
            Comment ça Marche
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold font-display">
                1
              </div>
              <h3 className="font-bold text-foreground font-display">
                Choisissez votre Mode
              </h3>
              <p className="text-sm text-muted-foreground">
                Simulateur pour calculer un prix, ou Upload pour contribuer aux données.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold font-display">
                2
              </div>
              <h3 className="font-bold text-foreground font-display">
                Configurez ou Validez
              </h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez vos pièces ou validez les données extraites de votre screenshot.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold font-display">
                3
              </div>
              <h3 className="font-bold text-foreground font-display">
                Obtenez vos Résultats
              </h3>
              <p className="text-sm text-muted-foreground">
                Estimations précises basées sur l'algorithme d'apprentissage communautaire.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container py-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2026 Eco-Sim. Alimenté par la communauté.
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                ☕ Buy Me a Coffee
              </Button>
              <Button variant="outline" size="sm">
                💳 PayPal
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}