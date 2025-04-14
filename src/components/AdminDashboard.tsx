import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AddPlant from './AddPlant';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddPlantSuccess = () => {
    setOpenAddDialog(false);
    // You could add a success message or refresh data here
  };

  return (
    <>
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          py: 4,
          mb: 4
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DashboardIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" fontWeight="bold">
                Admin Dashboard
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleSignOut}
              startIcon={<LogoutIcon />}
              sx={{ borderRadius: 2 }}
            >
              Sign Out
            </Button>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.8 }}>
            Welcome, {user?.email}
          </Typography>
        </Container>
      </Box>
      
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="medium" gutterBottom>
                Plant Management
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddDialog(true)}
                  sx={{ borderRadius: 2, py: 1.5 }}
                  fullWidth
                >
                  Add New Plant
                </Button>
              </Box>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<StoreIcon />}
                onClick={() => navigate('/')}
                sx={{ borderRadius: 2, py: 1.5 }}
                fullWidth
              >
                View Plant Catalog
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h5" fontWeight="medium" gutterBottom>
                  Quick Stats
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body1" paragraph>
                  This is your admin dashboard where you can manage the plant catalog.
                </Typography>
                
                <Typography variant="body1">
                  Use the controls on the left to add new plants or view the catalog.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button size="small" onClick={() => navigate('/')}>
                  Go to Home Page
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Add Plant Dialog */}
      <AddPlant
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        onPlantAdded={handleAddPlantSuccess}
      />
    </>
  );
};

export default AdminDashboard;
