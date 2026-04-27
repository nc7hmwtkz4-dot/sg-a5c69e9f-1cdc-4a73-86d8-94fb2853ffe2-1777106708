const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach(line => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      process.env[key.trim()] = value;
    }
  });
}

const { runCompleteLearning } = require("../src/services/learningEngineService");

console.log("🚀 Démarrage de l'algorithme d'apprentissage...");

runCompleteLearning()
  .then(() => {
    console.log("✅ Apprentissage terminé avec succès !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'apprentissage:", error);
    process.exit(1);
  });