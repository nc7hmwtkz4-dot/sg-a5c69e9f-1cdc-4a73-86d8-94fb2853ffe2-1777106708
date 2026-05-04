---
title: "Audit logique critique"
status: in_progress
priority: high
type: bug
tags:
  - audit
  - simulateur
  - apprentissage
  - logique
created_by: agent
created_at: 2026-05-04 21:02:32 UTC
position: 9
---

## Notes
Audit ciblé sur les chemins critiques qui peuvent produire des erreurs de calcul similaires au bug x2 corrigé. La portée inclut le simulateur, les services qui fournissent les bonus, les points de fallback quand les données sont absentes, et les normalisations de rareté qui peuvent casser les jointures logiques entre apprentissage et affichage. L’objectif est de sécuriser les calculs min, reco, max et x2 pour tous les types de voitures sans modifier inutilement le reste de l’application.

## Checklist
- [ ] Vérifier la chaîne complète simulateur → services → tables de bonus → apprentissage
- [ ] Identifier les fallbacks implicites ou incohérents sur les prix et la réputation
- [ ] Vérifier la normalisation des raretés et des types entre apprentissage et simulateur
- [ ] Corriger minimalement les points à risque prouvés par le code ou les données réelles
- [ ] Retirer les branches de logique redondantes ou dangereuses dans les chemins critiques
- [ ] Valider avec au moins un cas concret par type si les données sont disponibles
- [ ] Mettre à jour la tâche avec le résultat de l’audit

## Acceptance
Les calculs critiques du simulateur n’utilisent plus de fallback silencieux incohérent quand des données existent.
Les raretés et types utilisés par l’apprentissage et le simulateur sont normalisés de façon compatible.
Un cas concret vérifiable montre que les prix affichés suivent bien les bonus appris attendus.