import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Plants from './components/Plants';
import Order from './components/Order';
import OrderTracking from './components/OrderTracking';
import SupabaseTest from './components/SupabaseTest';
import DatabaseSeeder from './components/DatabaseSeeder';
import { Plant, Cart } from './types';

const App: React.FC = () => {
  const [cart, setCart] = useState<Cart>({});
  const [showOrder, setShowOrder] = useState<boolean>(false);
  const [plants, setPlants] = useState<Plant[]>([]);

  const resetCart = () => {
    setCart({});
    setShowOrder(false);
  };

  const cartItemsCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Plant Catalog
                </Typography>
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
                  isAdmin={true}
                />
              )}
            </Container>
          </>
        } />
        <Route path="/track-order/:trackingId" element={<OrderTracking />} />
        <Route path="/test" element={<SupabaseTest />} />
        <Route path="/seed" element={<DatabaseSeeder />} />
      </Routes>
    </Router>
  );
};

export default App;

