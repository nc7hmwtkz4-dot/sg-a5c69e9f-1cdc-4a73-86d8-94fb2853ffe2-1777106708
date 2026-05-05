---
title: "Nettoyage ciblé du code"
status: in_progress
priority: medium
type: chore
tags:
  - nettoyage
  - maintenance
  - debug
created_by: agent
created_at: 2026-05-05 05:46:50 UTC
position: 10
---

## Notes
Passe ciblée de nettoyage sans modifier inutilement la logique métier validée. La priorité est de retirer les logs de debug, le code mort, les variables devenues inutiles après les correctifs récents, et les branches obsolètes qui compliquent la maintenance. La chaîne critique du simulateur et de l’apprentissage doit rester strictement équivalente fonctionnellement.
Première passe terminée sur `src/pages/simulateur.tsx` et `src/services/learningEngineService.ts`. Il reste des logs de debug dans `src/pages/upload.tsx` et `src/pages/api/run-learning.ts` avant validation finale.

## Checklist
- [ ] Retirer les logs de debug verbeux dans le simulateur et les services métier critiques
- [ ] Supprimer les variables, constantes et branches devenues inutiles après les correctifs récents
- [ ] Rechercher les traces restantes de code mort ou obsolète dans l’application
- [ ] Vérifier que le nettoyage ne modifie pas le comportement utilisateur
- [ ] Valider avec check_for_errors et marquer la tâche terminée

## Acceptance
Le code critique ne contient plus de traces de debug inutiles pour le fonctionnement normal.
Les éléments obsolètes ou morts retirés ne changent pas le comportement du simulateur.
Le projet passe la validation sans nouvelles erreurs.