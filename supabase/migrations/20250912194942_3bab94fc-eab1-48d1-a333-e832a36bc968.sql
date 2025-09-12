-- Drop the existing policy that only allows users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create policies to allow admins to manage all profiles and users to update their own
CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" 
ON profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Also ensure admins can insert profiles for user creation
CREATE POLICY "Admins can insert profiles" 
ON profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow the system trigger to insert profiles during user creation
CREATE POLICY "System can insert profiles" 
ON profiles 
FOR INSERT 
WITH CHECK (true);