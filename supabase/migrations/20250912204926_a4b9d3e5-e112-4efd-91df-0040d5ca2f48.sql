-- Lock down profiles edits to admins only
BEGIN;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update their own profile" ON public.profiles';
  END IF;
END $$;
COMMIT;