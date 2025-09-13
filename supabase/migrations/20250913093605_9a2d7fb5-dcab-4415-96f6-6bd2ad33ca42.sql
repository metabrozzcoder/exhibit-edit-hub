-- Add language preference to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN language_preference text DEFAULT 'en' NOT NULL;