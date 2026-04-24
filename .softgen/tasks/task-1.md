---
title: Database Schema & Services
status: in_progress
priority: urgent
type: feature
tags: [backend, database]
created_by: agent
created_at: 2026-04-24T07:15:48Z
position: 1
---

## Notes
Foundation layer — database tables + TypeScript services for all data operations. Tables created: car_types, cars, part_weights, observations. Need type-safe services for CRUD operations and learning algorithm.

## Checklist
- [x] Create car_types table with rarity multipliers
- [x] Create cars table with brand/model/type/base stats
- [x] Create part_weights table (learning brain)
- [x] Create observations table (validation history)
- [x] Seed initial data (types, parts, reference cars)
- [x] Enable RLS policies
- [ ] Create carService.ts with getBrands, getModelsByBrand, getCarDetails
- [ ] Create partWeightsService.ts with getRarityBonuses
- [ ] Create observationService.ts with createObservation, getObservationCount
- [ ] Create learningService.ts with updatePartWeights algorithm

## Acceptance
- Dropdown menus populate with real database brands/models
- Part weights update automatically when new observations are validated
- Confidence metrics display based on observation_count