-- 1. Create car_types table
CREATE TABLE car_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  base_ratio DECIMAL(5,2) NOT NULL,
  gap_max_min BIGINT NOT NULL,
  gap_reco_min BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create cars table
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) UNIQUE NOT NULL,
  type_id INT REFERENCES car_types(id) ON DELETE RESTRICT,
  base_reputation INT NOT NULL,
  base_price_min BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create part_weights table (the learning brain)
CREATE TABLE part_weights (
  rarity VARCHAR(50) PRIMARY KEY,
  bonus_reputation_avg DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus_price_min_avg DECIMAL(15,2) NOT NULL DEFAULT 0,
  observation_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create observations table (source of truth)
CREATE TABLE observations (
  id SERIAL PRIMARY KEY,
  car_id INT REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rep_total INT NOT NULL,
  price_min_total BIGINT NOT NULL,
  engine_rarity VARCHAR(50),
  clutch_rarity VARCHAR(50),
  turbo1_rarity VARCHAR(50),
  turbo2_rarity VARCHAR(50),
  suspension1_rarity VARCHAR(50),
  suspension2_rarity VARCHAR(50),
  transmission_rarity VARCHAR(50),
  tires_rarity VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE car_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read for reference data, authenticated write for observations
CREATE POLICY "public_read_car_types" ON car_types FOR SELECT USING (true);
CREATE POLICY "public_read_cars" ON cars FOR SELECT USING (true);
CREATE POLICY "public_read_part_weights" ON part_weights FOR SELECT USING (true);

CREATE POLICY "public_read_observations" ON observations FOR SELECT USING (true);
CREATE POLICY "auth_insert_observations" ON observations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insert initial car types
INSERT INTO car_types (name, base_ratio, gap_max_min, gap_reco_min) VALUES
('Eco', 0.40, 2450000, 700000),
('Rare', 0.40, 2450000, 700000),
('Singulière', 0.50, 142500, 95000),
('Légendaire', 1.00, 91000000, 14000000),
('Secrète', 0.95, 237500000, 25000000);

-- Insert initial part weights (starting knowledge)
INSERT INTO part_weights (rarity, bonus_reputation_avg, bonus_price_min_avg, observation_count) VALUES
('Stock', 0, 0, 100),
('Gris', 1240.00, 3612.00, 50),
('Singulière', 1970.00, 10815.00, 50),
('Rare', 3120.00, 54040.00, 50),
('Épique', 4960.00, 324162.00, 30),
('Légendaire', 10925.00, 3500000.00, 5);

-- Insert initial car models
INSERT INTO cars (brand, model, type_id, base_reputation, base_price_min) VALUES
('Takada', 'Kame', 3, 475, 47500),
('Bomber', 'E30', 2, 2800, 350000),
('Barnett', 'Spirit', 5, 18750, 18750000),
('Ferrini', '578', 5, 22100, NULL);