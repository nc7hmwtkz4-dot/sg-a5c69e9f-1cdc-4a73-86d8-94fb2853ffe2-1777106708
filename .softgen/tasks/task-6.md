---
title: Simplifier le projet - Retirer l'OCR
status: done
priority: high
type: feature
tags: [refactoring, simplification]
created_by: agent
created_at: 2026-04-24T09:09:39Z
position: 6
---

## Notes
L'utilisateur souhaite simplifier le projet en retirant complètement la fonctionnalité OCR. Le projet doit se concentrer uniquement sur :
- Saisie manuelle des caractéristiques via formulaire
- Simulateur de prix

À retirer :
- Upload d'images et analyse OCR
- API analyze-image
- Service imageAnalysisService

## Checklist
- [x] Créer task de simplification
- [x] Supprimer l'API route analyze-image
- [x] Supprimer le service imageAnalysisService
- [x] Simplifier upload.tsx en formulaire de saisie simple
- [x] Mettre à jour index.tsx (retirer référence OCR)
- [x] Mettre à jour project.md
- [x] Vérifier les erreurs

## Acceptance
- Le projet démarre sans erreurs
- Le formulaire de saisie manuelle fonctionne
- Le simulateur reste opérationnel