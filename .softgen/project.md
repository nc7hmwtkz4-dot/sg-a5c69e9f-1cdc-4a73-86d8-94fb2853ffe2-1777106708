# OSCar Evaluation — Automotive Market Intelligence Platform

## Vision
Transform tedious manual price tracking into a data-driven system that learns from community observations to provide the most accurate in-game automotive market predictions. Built for manual data entry and real-time price simulation.

**Current Database:** 28 brands, 100+ models, 100+ real observations training the learning algorithm.

## Design
**Dark Premium Automotive** — Inspired by modern dark interfaces with automotive racing aesthetics

**Colors:**
- `--background: 220 30% 8%` (deep marine black - premium depth)
- `--foreground: 0 0% 98%` (pearl white - high contrast)
- `--primary: 220 90% 55%` (electric blue - tech authority)
- `--accent: 25 95% 53%` (racing orange - energy & CTAs)
- `--card: 220 25% 12%` (dark slate cards with glassmorphism)
- `--muted: 220 20% 25%` (medium gray - subtle elements)
- `--border: 220 30% 18%` (subtle borders with glow effects)

**Typography:**
- Headings: Chakra Petch (700) — angular, automotive-inspired
- Body: Inter (400, 600) — premium readability

**Style:** Dark glassmorphism cards, subtle glows, generous spacing, centered layouts, premium depth effects, gradient accents

## Features
- **Manual Data Entry**: Simple form for entering vehicle characteristics (brand, model, reputation, price, parts rarity)
- **Learning Engine**: Weighted average algorithm that refines part bonus values with each validated observation (currently trained on 100+ real observations)
- **Price Simulator**: Cascading dropdowns (brand → model), 8 rarity selectors, real-time price estimates (Min/Max/Reco/x2)
- **Confidence Indicators**: Display observation count and reliability metrics
- **Monetization**: Google AdSense placement + PayPal/Buy Me a Coffee donation buttons