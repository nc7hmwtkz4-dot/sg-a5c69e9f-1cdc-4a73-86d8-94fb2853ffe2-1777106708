---
title: "Correctif calcul x2"
status: in_progress
priority: urgent
type: bug
tags:
  - simulateur
  - apprentissage
  - x2
created_by: agent
created_at: 2026-05-04 20:40:58 UTC
position: 8
---

## Notes
Le bug signalé concerne le calcul du prix x2 dans le simulateur. Les autres prix sont globalement cohérents selon les retours utilisateur, donc le correctif doit rester ciblé. Les indices actuels pointent vers la chaîne d'apprentissage qui alimente `part_weights_by_type` et `part_weights`, avec un risque particulier quand un véhicule n'a pas d'observation stock. Le cas de référence à valider est Bomber E30.

## Checklist
- [ ] Vérifier la chaîne apprentissage → tables de bonus → simulateur avec le cas Bomber E30
- [ ] Vérifier le fallback x2 quand un véhicule n'a pas d'observation stock
- [ ] Corriger minimalement le calcul ou le fallback sans casser les prix min, reco et max
- [ ] Relancer l'apprentissage et valider les nouvelles valeurs x2 en base
- [ ] Vérifier un cas concret et mettre à jour la tâche

## Acceptance
Le prix x2 n'utilise plus une base incohérente quand des pièces sont ajoutées.
Les bonus x2 appris en base restent dans un ordre de grandeur cohérent avec les observations disponibles.
Le cas Bomber E30 peut être expliqué de bout en bout entre observation stock, bonus appris et affichage simulateur.