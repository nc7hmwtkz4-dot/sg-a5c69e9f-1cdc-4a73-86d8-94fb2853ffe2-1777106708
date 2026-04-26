-- Ajouter aussi dans part_weights (moyennes globales)
ALTER TABLE part_weights
ADD COLUMN IF NOT EXISTS bonus_price_x2_avg INTEGER DEFAULT 0;