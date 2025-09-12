-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Create a security definer function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Now create policies using the function to avoid recursion
CREATE POLICY "Admins can update all profiles" 
ON profiles 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can insert profiles" 
ON profiles 
FOR INSERT 
WITH CHECK (public.is_admin());