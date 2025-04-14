import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import { supabase } from '../supabase/config';
import { AdminLoginSchema, formatZodError } from '../schemas';

const AdminSetup: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      const validationResult = AdminLoginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        setError(formatZodError(validationResult.error));
        setLoading(false);
        return;
      }

      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Then, add the user to the admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([
          {
            user_id: authData.user.id,
            email: email,
          },
        ]);

      if (adminError) {
        // If there was an error adding to admin_users, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Failed to create admin user: ${adminError.message}`);
      }

      setSuccess(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Admin setup error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Admin Setup
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.8 }}>
            Create your first admin user
          </Typography>
        </Box>
        
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Admin user created successfully! You can now <Button onClick={() => navigate('/admin/login')}>login</Button>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              disabled={loading}
            />
            
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              disabled={loading}
              helperText="Password must be at least 6 characters"
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Admin User'}
            </Button>
          </form>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            This page is for initial setup only. After creating an admin user, you should restrict access to this page.
          </Typography>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button onClick={() => navigate('/')} color="primary">
              Back to Home
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSetup;
