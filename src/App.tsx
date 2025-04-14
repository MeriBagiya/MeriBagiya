import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Plants from './components/Plants';
import Order from './components/Order';
import OrderTracking from './components/OrderTracking';
import SupabaseTest from './components/SupabaseTest';
import DatabaseSeeder from './components/DatabaseSeeder';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSetup from './components/AdminSetup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Plant, Cart } from './types';

// Main app content with navigation and cart functionality
const MainContent: React.FC = () => {
  const [cart, setCart] = useState<Cart>({});
  const [showOrder, setShowOrder] = useState<boolean>(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const { isAdmin } = useAuth();

  const resetCart = () => {
    setCart({});
    setShowOrder(false);
  };

  const cartItemsCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Plant Catalog
          </Typography>

          {isAdmin && (
            <Button
              color="inherit"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => window.location.href = '/admin/dashboard'}
              sx={{ mr: 2 }}
            >
              Admin
            </Button>
          )}

          <Button
            color="inherit"
            onClick={() => setShowOrder(!showOrder)}
            startIcon={
              <Badge badgeContent={cartItemsCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            }
          >
            {showOrder ? 'Back to Catalog' : 'View Cart'}
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        {showOrder ? (
          <Order cart={cart} plants={plants} onOrderComplete={resetCart} />
        ) : (
          <Plants
            setCart={setCart}
            cart={cart}
            setPlants={setPlants}
            plants={plants}
            isAdmin={isAdmin}
          />
        )}
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/track-order/:trackingId" element={<OrderTracking />} />
          <Route path="/test" element={<SupabaseTest />} />
          <Route path="/seed" element={<DatabaseSeeder />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;