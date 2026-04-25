-- Ajouter une colonne prix_x2 dans observations si elle n'existe pas déjà
-- (vérifier d'abord via get_database_schema si nécessaire)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'observations' AND column_name = 'price_x2'
  ) THEN
    ALTER TABLE observations ADD COLUMN price_x2 BIGINT;
  END IF;
END $$;