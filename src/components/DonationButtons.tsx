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
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
          <Heart className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-2xl font-bold font-display">Soutenez le Projet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          OSCar Evaluation est gratuit, votre participation nous aide à couvrir les frais d'hébergement et à continuer d'améliorer la plateforme, et développer de nouvelles fonctionnalités
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <a
          href="https://www.paypal.com/donate/?hosted_button_id=YOUR_BUTTON_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0070ba] hover:bg-[#005a92] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.720-4.458z"/>
          </svg>
          Faire un don via PayPal
        </a>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Sécurisé
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Sans inscription
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full"></span>
            100% transparent
          </span>
        </div>
      </div>
    </Card>
  );
}