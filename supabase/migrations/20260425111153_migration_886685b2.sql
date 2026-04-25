-- Ajouter une colonne pour stocker le coefficient K moyen par type de voiture
ALTER TABLE car_types
ADD COLUMN IF NOT EXISTS k_multiplier_avg DECIMAL(10,4) DEFAULT 2.3,
ADD COLUMN IF NOT EXISTS k_observation_count INT DEFAULT 0;