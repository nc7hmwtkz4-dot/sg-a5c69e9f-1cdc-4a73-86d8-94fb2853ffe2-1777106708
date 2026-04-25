-- 2. TABLE cars - Tous les modèles de voitures
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) UNIQUE NOT NULL,
  type_id INT REFERENCES car_types(id),
  base_reputation INT,
  base_price_min BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_type ON cars(type_id);