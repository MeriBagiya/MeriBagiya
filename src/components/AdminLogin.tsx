import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Paper,
  useTheme
} from '@mui/material';
import { AdminLoginSchema, formatZodError } from '../schemas';
import { useAuth } from '../contexts/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const AdminLogin: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  // Get the redirect path from location state or default to '/'
  const from = (location.state as { from?: string })?.from || '/';
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validationResult = AdminLoginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        setError(formatZodError(validationResult.error));
        setLoading(false);
        return;
      }

      // Attempt to sign in
      const { success, error: signInError } = await signIn(email, password);
      
      if (success) {
        // Redirect to the page they were trying to access or home
        navigate(from, { replace: true });
      } else {
        setError(signInError || 'Failed to sign in');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 1,
              mb: 2
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Typography variant="h4" fontWeight="bold">
            Admin Login
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            This login is for administrators only.
          </Typography>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
