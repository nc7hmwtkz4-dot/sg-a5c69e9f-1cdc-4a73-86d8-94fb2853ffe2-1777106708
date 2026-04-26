-- Ajouter la colonne bonus_price_x2_avg dans part_weights_by_type
ALTER TABLE part_weights_by_type
ADD COLUMN IF NOT EXISTS bonus_price_x2_avg INTEGER DEFAULT 0;