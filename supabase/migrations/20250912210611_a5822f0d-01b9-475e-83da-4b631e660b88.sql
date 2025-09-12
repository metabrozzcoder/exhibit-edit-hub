-- Enable real-time for artifact_history table
ALTER TABLE public.artifact_history REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
BEGIN;
-- Remove if exists and re-add to ensure it's properly configured
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.artifacts, public.artifact_history, public.reports, public.profiles;
COMMIT;