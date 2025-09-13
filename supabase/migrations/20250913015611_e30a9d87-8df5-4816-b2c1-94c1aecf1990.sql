-- Make user reference columns nullable to allow CASCADE DELETE with SET NULL
-- This allows users to be deleted while preserving the data they created/edited

-- Fix artifacts table - make user reference columns nullable
ALTER TABLE public.artifacts ALTER COLUMN last_edited_by DROP NOT NULL;
ALTER TABLE public.artifacts ALTER COLUMN created_by DROP NOT NULL;

-- Fix artifact_history table - make user reference column nullable  
ALTER TABLE public.artifact_history ALTER COLUMN edited_by DROP NOT NULL;

-- Fix reports table - make user reference columns nullable
ALTER TABLE public.reports ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.reports ALTER COLUMN reviewed_by DROP NOT NULL;