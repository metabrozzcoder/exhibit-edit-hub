-- Update the location check constraint to allow 'custom' value
ALTER TABLE public.artifacts DROP CONSTRAINT IF EXISTS artifacts_location_check;
ALTER TABLE public.artifacts ADD CONSTRAINT artifacts_location_check 
  CHECK (location IN ('warehouse', 'vitrine', 'custom'));