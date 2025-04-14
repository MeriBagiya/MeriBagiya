import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { Box, Typography, Button, Alert } from '@mui/material';
import ErrorMessage from './ErrorMessage';

interface SchemaTable {
  tablename: string;
}

const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking connection...');
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);

  const testConnection = async (): Promise<void> => {
    try {
      setStatus('Testing connection...');
      setError(null);

      // Test if we can connect to Supabase
      const { data, error, count } = await supabase
        .from('plants')
        .select('*', { count: 'exact' });

      if (error) throw error;

      // Data and count retrieved successfully

      setStatus(`Connection successful! Found ${data ? data.length : 0} plants records.`);

      // Try to get schema information
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');

        if (schemaError) {
          // Could not fetch schema information
        } else if (schemaData) {
          setTables((schemaData as SchemaTable[]).map(t => t.tablename));
        }
      } catch (schemaErr) {
        // Schema query error, but we can ignore it
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('Connection failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Supabase Connection Test</Typography>

      <ErrorMessage message={error} />
      {!error && (
        <Alert severity={status.includes('successful') ? 'success' : 'info'} sx={{ mb: 2 }}>
          {status}
        </Alert>
      )}

      <Button variant="contained" onClick={testConnection} sx={{ mb: 3 }}>
        Test Again
      </Button>

      {tables.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Available Tables:</Typography>
          <ul>
            {tables.map((table, index) => (
              <li key={index}>{table}</li>
            ))}
          </ul>
        </>
      )}
    </Box>
  );
};

export default SupabaseTest;
