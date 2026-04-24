import { Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Donation Buttons Component
 * 
 * PRD Requirements:
 * - PayPal donation button
 * - Buy Me a Coffee button
 * - Visible in footer and on results pages
 * - Optional progress bar showing hosting costs
 */

type DonationButtonsProps = {
  showProgressBar?: boolean;
  className?: string;
};

export function DonationButtons({ 
  showProgressBar = false,
  className = ""
}: DonationButtonsProps) {
  const paypalLink = process.env.NEXT_PUBLIC_PAYPAL_DONATION_URL || "#";
  const buyMeCoffeeLink = process.env.NEXT_PUBLIC_BUYMECOFFEE_URL || "#";

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-accent" />
          <h3 className="font-bold font-display">Soutenez Eco-Sim</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ce projet est gratuit et open source. Aidez-nous à couvrir les frais d'hébergement et d'IA.
        </p>
      </div>

      {showProgressBar && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Objectif mensuel</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500" 
              style={{ width: "45%" }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            180€ / 400€ pour l'hébergement et l'API OpenAI
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          asChild
          variant="outline"
          className="border-[#0070ba] text-[#0070ba] hover:bg-[#0070ba]/10"
        >
          <a 
            href={paypalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .759-.64h8.56c2.684 0 4.535 1.478 4.535 4.223 0 3.556-2.888 5.604-6.854 5.604h-3.33l-1.538 8.43zm6.854-13.697c1.573 0 2.684.733 2.684 2.223 0 2.084-1.573 3.223-3.684 3.223h-2.33l.844-4.623c.044-.243.249-.443.499-.443h2.987z"/>
            </svg>
            PayPal
          </a>
        </Button>

        <Button
          asChild
          variant="default"
          className="bg-[#FFDD00] text-gray-900 hover:bg-[#FFDD00]/90"
        >
          <a 
            href={buyMeCoffeeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Coffee className="w-4 h-4" />
            Buy Me a Coffee
          </a>
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Merci pour votre soutien ! 🙏
      </p>
    </Card>
  );
}

/**
 * Compact Donation Button (for footer)
 */
export function CompactDonationButton() {
  const buyMeCoffeeLink = process.env.NEXT_PUBLIC_BUYMECOFFEE_URL || "#";

  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="border-accent text-accent hover:bg-accent/10"
    >
      <a 
        href={buyMeCoffeeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <Coffee className="w-3 h-3" />
        Nous soutenir
      </a>
    </Button>
  );
}