-- Fix artifact deletion failure due to foreign key on artifact_history
-- Drop FK so history can store deleted artifact ids safely
BEGIN;
ALTER TABLE public.artifact_history
  DROP CONSTRAINT IF EXISTS artifact_history_artifact_id_fkey;

-- Optional: keep lookup performance without FK
CREATE INDEX IF NOT EXISTS idx_artifact_history_artifact_id
  ON public.artifact_history(artifact_id);
COMMIT;