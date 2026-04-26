-- Ajouter les colonnes price_max et price_reco dans observations
ALTER TABLE observations
ADD COLUMN IF NOT EXISTS price_max BIGINT,
ADD COLUMN IF NOT EXISTS price_reco BIGINT;