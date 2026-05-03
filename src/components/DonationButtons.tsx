import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function DonationButtons() {
  const { t } = useLanguage();

  return (
    <Card className="p-8 text-center space-y-6 bg-gradient-to-br from-card to-card/80 border-primary/20">
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary animate-pulse" />
          <h2 className="text-2xl font-bold font-display">{t("donation.title")}</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("donation.description")}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50 transition-all"
          asChild
        >
          <a 
            href="https://paypal.me/aubertth" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            💳 {t("donation.paypal")}
          </a>
        </Button>
      </div>
    </Card>
  );
}