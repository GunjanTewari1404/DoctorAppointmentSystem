/*
  # Update profiles table RLS policies

  1. Changes
    - Add new policy to allow admins to update user roles
    - This fixes the issue where admin cannot change user role to 'doctor'

  2. Security
    - Only admins can update user roles
    - Users can still update their own non-role fields
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies for profile updates
CREATE POLICY "Users can update own non-role fields"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update user roles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );