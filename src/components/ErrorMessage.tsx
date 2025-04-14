import React from 'react';
import { Alert, Box, Button, Typography, CircularProgress } from '@mui/material';

interface ErrorMessageProps {
  message: string | null;
  retrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
}

/**
 * A reusable error message component that can display an error with optional retry functionality
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  retrying = false,
  retryCount = 0,
  maxRetries = 0,
  onRetry
}) => {
  if (!message) return null;

  return (
    <Box p={2}>
      <Alert severity="error">
        {message}
        {retrying && retryCount < maxRetries ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2">
              Retrying automatically... Attempt {retryCount + 1} of {maxRetries}
            </Typography>
          </Box>
        ) : onRetry && (
          <Button
            onClick={onRetry}
            sx={{ ml: 2 }}
            disabled={retrying && retryCount < maxRetries}
          >
            Try Again
          </Button>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
