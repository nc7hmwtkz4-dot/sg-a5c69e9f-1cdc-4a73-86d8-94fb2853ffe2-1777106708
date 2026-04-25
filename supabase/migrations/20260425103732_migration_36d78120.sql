-- 4. TABLE observations - Source de vérité
CREATE TABLE observations (
  id SERIAL PRIMARY KEY,
  car_id INT REFERENCES cars(id) ON DELETE CASCADE,
  user_id INT,
  rep_total INT NOT NULL,
  price_min_total BIGINT NOT NULL,
  -- Les 8 pièces
  engine_rarity VARCHAR(50),
  clutch_rarity VARCHAR(50),
  turbo1_rarity VARCHAR(50),
  turbo2_rarity VARCHAR(50),
  suspension1_rarity VARCHAR(50),
  suspension2_rarity VARCHAR(50),
  transmission_rarity VARCHAR(50),
  tires_rarity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_observations_car ON observations(car_id);
CREATE INDEX idx_observations_created ON observations(created_at);