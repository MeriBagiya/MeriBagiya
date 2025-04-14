# Admin Setup Instructions

This document provides instructions on how to set up admin users for the Plant Catalog application.

## Setting Up the Admin Users Table

Before you can use the admin functionality, you need to set up the admin_users table in your Supabase database.

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `src/sql/create_admin_users.sql` into the SQL Editor
4. Run the SQL script to create the necessary table and functions

## Creating Your First Admin User

There are two ways to create an admin user:

### Method 1: Using the Admin Setup Page

1. Navigate to `/admin/setup` in your application
2. Fill in the email and password for your admin user
3. Click "Create Admin User"
4. Once created, you can log in at `/admin/login`

### Method 2: Using SQL (for advanced users)

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run the following SQL command:

```sql
SELECT add_admin_user('your-admin-email@example.com', 'your-secure-password');
```

## Securing the Admin Setup Page

After you've created your initial admin user, you should restrict access to the `/admin/setup` page to prevent unauthorized users from creating admin accounts.

You can do this by:

1. Adding authentication checks to the route
2. Removing the route entirely from your production build
3. Setting up Row Level Security (RLS) policies in Supabase to prevent further insertions into the admin_users table

## Using Admin Features

Once logged in as an admin, you can:

1. Access the admin dashboard at `/admin/dashboard`
2. Add new plants to the catalog
3. See an "Admin" button in the main navigation when browsing the plant catalog

## Troubleshooting

If you encounter issues with admin authentication:

1. Check that the admin_users table was created correctly
2. Verify that the user exists in both the auth.users table and the admin_users table
3. Check the browser console for any error messages
4. Ensure your Supabase configuration is correct
