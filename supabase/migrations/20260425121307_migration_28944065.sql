-- 1. SUPPRIMER l'ancienne tentative et recréer proprement
DROP TABLE IF EXISTS part_weights_by_type CASCADE;

CREATE TABLE part_weights_by_type (
  id SERIAL PRIMARY KEY,
  car_type_id INT NOT NULL REFERENCES car_types(id) ON DELETE CASCADE,
  part_rarity VARCHAR(50) NOT NULL,
  bonus_price_min_avg DECIMAL(15,2) DEFAULT 0,
  bonus_reputation_avg DECIMAL(10,2) DEFAULT 0,
  observation_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(car_type_id, part_rarity)
);

CREATE INDEX idx_part_weights_by_type ON part_weights_by_type(car_type_id, part_rarity);