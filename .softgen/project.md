# Eco-Sim — Automotive Market Intelligence Platform

## Vision
Transform tedious manual price tracking into a data-driven system that learns from community observations to provide the most accurate in-game automotive market predictions. Built for manual data entry and real-time price simulation.

**Current Database:** 28 brands, 100+ models, 100+ real observations training the learning algorithm.

## Design
**Colors:**
- `--primary: 220 90% 25%` (deep navy - data authority)
- `--accent: 25 95% 53%` (racing orange - energy & CTAs)
- `--background: 0 0% 98%` (pearl white)
- `--foreground: 220 25% 15%` (dark slate)
- `--muted: 220 15% 92%` (light gray panels)
- `--card: 0 0% 100%` (pure white)

**Typography:**
- Headings: Chakra Petch (700) — angular, automotive-inspired
- Body: Inter (400, 600) — data readability

**Style:** Card-based layouts, subtle elevation, color-coded rarity badges, clean form inputs, real-time calculation displays

## Features
- **Manual Data Entry**: Simple form for entering vehicle characteristics (brand, model, reputation, price, parts rarity)
- **Learning Engine**: Weighted average algorithm that refines part bonus values with each validated observation (currently trained on 100+ real observations)
- **Price Simulator**: Cascading dropdowns (brand → model), 8 rarity selectors, real-time price estimates (Min/Max/Reco/x2)
- **Confidence Indicators**: Display observation count and reliability metrics
- **Monetization**: Google AdSense placement + PayPal/Buy Me a Coffee donation buttons