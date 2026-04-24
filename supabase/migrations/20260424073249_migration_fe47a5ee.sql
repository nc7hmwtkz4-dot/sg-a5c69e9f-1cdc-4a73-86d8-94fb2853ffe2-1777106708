-- Make base_reputation nullable to handle incomplete data
ALTER TABLE cars ALTER COLUMN base_reputation DROP NOT NULL;

-- Now retry the bulk insert with proper handling of NULL values
-- Bomber (B40 GTR has no data)
INSERT INTO cars (brand, model, type_id, base_reputation, base_price_min) VALUES
('Bomber', 'B40 GTR', (SELECT id FROM car_types WHERE name = 'Rare'), NULL, NULL)
ON CONFLICT (model) DO UPDATE SET 
  brand = EXCLUDED.brand,
  type_id = EXCLUDED.type_id,
  base_reputation = COALESCE(EXCLUDED.base_reputation, cars.base_reputation),
  base_price_min = COALESCE(EXCLUDED.base_price_min, cars.base_price_min);

-- Update Ferrini 578 model (was listed as Salerno in initial data, but 578 is the actual model name)
UPDATE cars 
SET model = '578', base_reputation = 22100
WHERE brand = 'Ferrini' AND model = 'Salerno';

-- Add Secrète rarity to part_weights (it was missing)
INSERT INTO part_weights (rarity, bonus_reputation_avg, bonus_price_min_avg, observation_count) VALUES
('Secrète', 0, 0, 0)
ON CONFLICT (rarity) DO NOTHING;