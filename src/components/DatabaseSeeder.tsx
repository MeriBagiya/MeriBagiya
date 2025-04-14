import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { seedPlantsDatabase, clearPlantsDatabase } from '../utils/seedPlants';

const DatabaseSeeder: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSeedDatabase = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await seedPlantsDatabase();
      
      setSuccess('Successfully added plants to the database!');
    } catch (error: any) {
      setError(`Error seeding database: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await clearPlantsDatabase();
      
      setSuccess('Successfully cleared plants from the database!');
    } catch (error: any) {
      setError(`Error clearing database: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Database Seeder
      </Typography>
      
      <Typography variant="body1" paragraph>
        Use this tool to seed your Supabase database with plant data from Urvann.com.
        This will add 10 plants to your database.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSeedDatabase}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Seed Database'}
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearDatabase}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Clear Database'}
        </Button>
      </Box>
    </Paper>
  );
};

export default DatabaseSeeder;
