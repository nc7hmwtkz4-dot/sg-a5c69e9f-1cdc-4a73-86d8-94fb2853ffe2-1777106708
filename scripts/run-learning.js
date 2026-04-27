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