import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function DonationButtons() {
  const { t } = useLanguage();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <h3 className="text-xl font-bold font-display">{t("donation.title")}</h3>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("donation.description")}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            className="border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500"
            asChild
          >
            <a
              href="https://paypal.me/YourPayPalLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="mr-2">💳</span>
              {t("donation.paypal")}
            </a>
          </Button>
          
          <Button
            variant="outline"
            className="border-yellow-500/50 hover:bg-yellow-500/10 hover:border-yellow-500"
            asChild
          >
            <a
              href="https://buymeacoffee.com/YourUsername"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="mr-2">☕</span>
              {t("donation.buymeacoffee")}
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}