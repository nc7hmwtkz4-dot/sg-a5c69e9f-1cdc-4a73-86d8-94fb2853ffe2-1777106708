---
title: Price Simulator
status: todo
priority: high
type: feature
tags: [calculator, ui]
created_by: agent
created_at: 2026-04-24T07:15:48Z
position: 4
---

## Notes
Real-time price calculator with cascading dropdowns and 8 rarity selectors. Shows Min/Max/Reco/x2 estimates with confidence indicators.

## Checklist
- [ ] Create /simulateur page
- [ ] Build brand dropdown (populated from cars table)
- [ ] Build model dropdown (filtered by selected brand)
- [ ] Create 8 part rarity selectors (Moteur, Embrayage, Turbo x2, Suspension x2, Transmission, Pneus)
- [ ] Implement real-time price calculation using part_weights
- [ ] Display results in card format (Prix Min, Max, Reco, x2)
- [ ] Add confidence indicators (green/yellow/red based on observation_count)
- [ ] Add "Copier" buttons next to each price value

## Acceptance
- Model dropdown updates when brand changes
- Price estimates update in real-time as rarity selectors change
- All 4 price types display with correct calculations