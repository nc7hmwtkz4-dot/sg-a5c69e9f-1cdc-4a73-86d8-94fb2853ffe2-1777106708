import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { runCompleteLearning } from "@/services/learningEngineService";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminPage() {
  const { t } = useLanguage();
  const [isLearning, setIsLearning] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleRunLearning = async () => {
    setIsLearning(true);
    setStatus("idle");
    setMessage(t("admin.learning.analyzing"));

    try {
      await runCompleteLearning();
      setStatus("success");
      setMessage(t("admin.learning.success"));
    } catch (error) {
      setStatus("error");
      setMessage(`${t("admin.learning.error")} ${error}`);
      console.error(error);
    } finally {
      setIsLearning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{t("admin.title")}</h1>
            <p className="text-muted-foreground">
              {t("admin.subtitle")}
            </p>
          </div>
          <LanguageSelector />
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold">{t("admin.learning.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.learning.subtitle")}
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p>
              <strong>{t("admin.learning.how")}</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("admin.learning.step1")}</li>
              <li>{t("admin.learning.step2")}</li>
              <li>{t("admin.learning.step3")}</li>
              <li>{t("admin.learning.step4")}</li>
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
                {t("admin.learning.running")}
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                {t("admin.learning.button")}
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
          <h3 className="text-lg font-semibold mb-4">{t("admin.info.title")}</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>{t("admin.info.database")}</strong>
            </p>
            <p>
              <strong>{t("admin.info.tables")}</strong>
            </p>
            <p>
              <strong>{t("admin.info.algorithm")}</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}