-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to read all admin users
CREATE POLICY "Admins can read all admin users"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Policy to allow authenticated users to read their own admin record
CREATE POLICY "Users can read their own admin record"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Create function to add a new admin user
CREATE OR REPLACE FUNCTION add_admin_user(admin_email TEXT, admin_password TEXT)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  new_admin_id UUID;
BEGIN
  -- Create a new user in auth.users
  INSERT INTO auth.users (email, password, email_confirmed_at)
  VALUES (admin_email, crypt(admin_password, gen_salt('bf')), NOW())
  RETURNING id INTO new_user_id;
  
  -- Add the user to the admin_users table
  INSERT INTO admin_users (user_id, email)
  VALUES (new_user_id, admin_email)
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example of how to add an admin user (run this in the SQL editor)
-- SELECT add_admin_user('admin@example.com', 'securepassword123');
