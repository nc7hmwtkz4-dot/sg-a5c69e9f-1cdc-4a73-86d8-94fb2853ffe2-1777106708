-- 1. TABLE car_types - 5 types de véhicules selon PDF DATA
CREATE TABLE car_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  base_ratio DECIMAL(5,2),
  gap_max_min BIGINT,
  gap_reco_min BIGINT
);

-- Insertion des 5 types selon le PRD
INSERT INTO car_types (name, base_ratio, gap_max_min, gap_reco_min) VALUES
('Singuliere', 0.50, 142500, 95000),
('Rare', 0.40, 2450000, 700000),
('Epique', 0.40, 2450000, 700000),
('Legendaire', 1.00, 91000000, 14000000),
('Secrete', 0.95, 237500000, 25000000);