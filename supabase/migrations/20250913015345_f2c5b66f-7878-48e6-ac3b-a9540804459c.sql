-- Fix foreign key constraints for user deletion
-- First, handle artifacts that reference users that will be deleted
-- Option 1: Set last_edited_by to NULL when user is deleted (recommended)
ALTER TABLE public.artifacts DROP CONSTRAINT IF EXISTS artifacts_last_edited_by_fkey;
ALTER TABLE public.artifacts DROP CONSTRAINT IF EXISTS artifacts_created_by_fkey;

-- Add new foreign key constraints with SET NULL on delete
ALTER TABLE public.artifacts 
ADD CONSTRAINT artifacts_last_edited_by_fkey 
FOREIGN KEY (last_edited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.artifacts 
ADD CONSTRAINT artifacts_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix artifact_history table foreign key constraint
ALTER TABLE public.artifact_history DROP CONSTRAINT IF EXISTS artifact_history_edited_by_fkey;
ALTER TABLE public.artifact_history 
ADD CONSTRAINT artifact_history_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix reports table foreign key constraints
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_created_by_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reviewed_by_fkey;

ALTER TABLE public.reports 
ADD CONSTRAINT reports_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.reports 
ADD CONSTRAINT reports_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;