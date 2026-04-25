import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { runCompleteLearning } from "@/services/learningEngineService";

export default function AdminPage() {
  const [isLearning, setIsLearning] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleRunLearning = async () => {
    setIsLearning(true);
    setStatus("idle");
    setMessage("Analyse des observations en cours...");

    try {
      await runCompleteLearning();
      setStatus("success");
      setMessage("✅ Apprentissage terminé avec succès ! Les moyennes ont été mises à jour.");
    } catch (error) {
      setStatus("error");
      setMessage(`❌ Erreur lors de l'apprentissage : ${error}`);
      console.error(error);
    } finally {
      setIsLearning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Administration Eco-Sim</h1>
          <p className="text-muted-foreground">
            Gestion de l'algorithme d'apprentissage et des données
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold">Algorithme d'Apprentissage</h2>
              <p className="text-sm text-muted-foreground">
                Analyse toutes les observations pour calculer les moyennes pondérées des bonus de pièces
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p>
              <strong>Fonctionnement :</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Charge toutes les observations de la base de données</li>
              <li>Utilise les poids du PRD pour distribuer les bonus proportionnellement</li>
              <li>Calcule les moyennes globales ET par type de véhicule</li>
              <li>Met à jour <code>part_weights</code> et <code>part_weights_by_type</code></li>
            </ul>
          </div>

          <Button
            onClick={handleRunLearning}
            disabled={isLearning}
            size="lg"
            className="w-full"
          >
            {isLearning ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Apprentissage en cours...
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                Lancer l'Apprentissage
              </>
            )}
          </Button>

          {message && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                status === "success"
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : status === "error"
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : "bg-blue-50 text-blue-900 border border-blue-200"
              }`}
            >
              {status === "success" && <CheckCircle className="w-5 h-5" />}
              {status === "error" && <AlertCircle className="w-5 h-5" />}
              {status === "idle" && <Loader2 className="w-5 h-5 animate-spin" />}
              <p className="text-sm">{message}</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informations</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Base de données :</strong> PostgreSQL via Supabase
            </p>
            <p>
              <strong>Tables utilisées :</strong> observations, cars, car_types, part_weights,
              part_weights_by_type
            </p>
            <p>
              <strong>Algorithme :</strong> Moyenne pondérée cumulative (PRD page 7-8)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}