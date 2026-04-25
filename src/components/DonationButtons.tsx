import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DonationButtons() {
  const handlePayPalDonate = () => {
    // PayPal donation link with the user's email
    const paypalUrl = `https://www.paypal.com/donate/?hosted_button_id=&business=aubert.th@gmail.com&currency_code=EUR&item_name=Soutenir+Eco-Sim`;
    window.open(paypalUrl, "_blank");
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
          <Heart className="w-6 h-6 text-accent" />
        </div>
        
        <div>
          <h3 className="font-display font-bold text-lg mb-2">
            Soutenez le Projet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Eco-Sim est gratuit et le restera. Vos dons nous aident à couvrir les frais d&apos;hébergement 
            et à continuer d&apos;améliorer la plateforme pour toute la communauté.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* PayPal Donation Button */}
          <Button
            onClick={handlePayPalDonate}
            className="bg-[#0070ba] hover:bg-[#003087] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L9.096 7.35a.972.972 0 0 1 .957-.817h4.86c1.595 0 2.718.33 3.335 1.007.18.2.328.42.446.664.27.556.425 1.228.425 2.042 0 .117-.004.238-.012.358" />
              <path d="M9.295 7.79c-.03.176-.013.357.05.518a.973.973 0 0 0 .907.635h4.86c1.595 0 2.718.33 3.335 1.007.18.2.328.42.446.664-.598 3.837-3.226 5.17-6.514 5.17h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558l1.853-11.74c.042-.268.27-.48.545-.48h4.86c.18 0 .36.015.535.043-.68-.02-1.43.03-2.11.287a2.913 2.913 0 0 0-1.524 1.316c-.267.456-.396.997-.506 1.415" />
            </svg>
            <span>Faire un don via PayPal</span>
          </Button>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Sécurisé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Sans inscription</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span>100% transparent</span>
          </div>
        </div>
      </div>
    </Card>
  );
}