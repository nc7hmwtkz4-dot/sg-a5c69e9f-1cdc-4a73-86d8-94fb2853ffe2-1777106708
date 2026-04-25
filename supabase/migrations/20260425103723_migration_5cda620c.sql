-- 3. TABLE part_weights - Le "cerveau" de l'application (7 types de pièces)
CREATE TABLE part_weights (
  rarity VARCHAR(50) PRIMARY KEY,
  bonus_reputation_avg DECIMAL(10,2) DEFAULT 0,
  bonus_price_min_avg DECIMAL(15,2) DEFAULT 0,
  observation_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertion des 7 types de pièces avec valeurs initiales du PRD
INSERT INTO part_weights (rarity, bonus_reputation_avg, bonus_price_min_avg, observation_count) VALUES
('Stock', 0, 0, 0),
('Gris', 1240, 3612, 0),
('Singuliere', 1970, 10815, 0),
('Rare', 3120, 54040, 0),
('Epique', 4960, 324162, 0),
('Legendaire', 10925, 3500000, 0),
('Secrete', 0, 10000000, 0);