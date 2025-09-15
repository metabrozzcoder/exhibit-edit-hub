-- Relax NOT NULL constraints on artifacts to allow optional fields
ALTER TABLE public.artifacts
  ALTER COLUMN accession_number DROP NOT NULL,
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN period DROP NOT NULL,
  ALTER COLUMN culture DROP NOT NULL,
  ALTER COLUMN material DROP NOT NULL,
  ALTER COLUMN condition DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL,
  ALTER COLUMN provenance DROP NOT NULL,
  ALTER COLUMN acquisition_date DROP NOT NULL,
  ALTER COLUMN acquisition_method DROP NOT NULL;
