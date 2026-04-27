import { Calculator, Upload, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DonationButtons } from "@/components/DonationButtons";
import { StickyBottomAd } from "@/components/AdSense";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
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
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary font-display">
              {t("app.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("app.subtitle")}
            </p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <section className="container pt-20 pb-16 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-display">
            {t("home.hero.title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("home.hero.description")}
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
                <CardTitle className="text-2xl font-display">{t("home.simulator.title")}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {t("home.simulator.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("home.simulator.feature1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("home.simulator.feature2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("home.simulator.feature3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("home.simulator.feature4")}</span>
                </li>
              </ul>
              <Link href="/simulateur">
                <Button className="w-full group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
                  {t("home.simulator.button")}
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
                  {t("home.stats.vehicles")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent font-display">
                  {stats.loading ? "..." : stats.observationCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("home.stats.observations")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground font-display">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("home.stats.opensource")}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Support Section */}
        <section className="container py-16">
          <Card className="border-border/50 backdrop-blur-sm bg-card/80 max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <DonationButtons />
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold font-display">{t("home.howto.title")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="text-4xl">📝</div>
              <h3 className="font-bold font-display">{t("home.howto.step1.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.howto.step1.description")}
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="text-4xl">🔄</div>
              <h3 className="font-bold font-display">{t("home.howto.step2.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.howto.step2.description")}
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="text-4xl">📊</div>
              <h3 className="font-bold font-display">{t("home.howto.step3.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.howto.step3.description")}
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
              {t("home.footer.copyright")}
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