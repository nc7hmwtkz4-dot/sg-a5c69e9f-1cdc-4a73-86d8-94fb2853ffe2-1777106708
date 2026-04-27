---
title: Système d'internationalisation (FR/EN/ES)
status: in_progress
priority: high
type: feature
tags: [i18n, ux]
created_by: agent
created_at: 2026-04-27T17:36:19Z
position: 7
---

## Notes
Implémenter un système complet d'internationalisation pour supporter le français (par défaut), l'anglais et l'espagnol. Le sélecteur de langue doit être visible en haut à droite de toutes les pages.

Contexte : Site de simulation de prix automobile avec formulaires, tableaux de données et interface administrative.

## Checklist
- [ ] Créer le contexte LanguageContext avec provider
- [ ] Créer les fichiers de traductions (fr.json, en.json, es.json)
- [ ] Créer le composant LanguageSelector (dropdown en haut à droite)
- [ ] Traduire la page d'accueil (index.tsx)
- [ ] Traduire le simulateur (simulateur.tsx)
- [ ] Traduire la page upload (upload.tsx)
- [ ] Traduire la page admin (admin.tsx)
- [ ] Intégrer le provider dans _app.tsx
- [ ] Ajouter le LanguageSelector dans toutes les pages
- [ ] Tester les 3 langues et la persistance dans localStorage

## Acceptance
- Le sélecteur de langue est visible en haut à droite sur toutes les pages
- Changement de langue se reflète instantanément sur tout le contenu
- La langue sélectionnée persiste après rechargement de page