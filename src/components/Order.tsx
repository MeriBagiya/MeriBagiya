import React, { useState } from 'react';
import { supabase } from '../supabase/config';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Link,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  FormHelperText
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import ErrorMessage from './ErrorMessage';
import { generateTrackingId } from '../utils/orderUtils';
import { Plant, Cart, OrderTracking as OrderTrackingType } from '../types';
import { CustomerInfoSchema, formatZodError, CustomerInfo } from '../schemas';
import { getPlaceholderImage } from '../utils/imageUtils';

interface OrderProps {
  cart: Cart;
  plants: Plant[];
  onOrderComplete: () => void;
}

const Order: React.FC<OrderProps> = ({ cart, plants, onOrderComplete }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderTracking, setOrderTracking] = useState<OrderTrackingType | null>(null);
  const theme = useTheme();

  const calculateTotal = (): number => {
    return Object.entries(cart).reduce((total, [plantId, quantity]) => {
      const plant = plants.find(p => p.id === plantId);
      if (plant) {
        return total + (plant.price * quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate customer information using Zod
    const validationResult = CustomerInfoSchema.safeParse(customerInfo);
    if (!validationResult.success) {
      setError(formatZodError(validationResult.error));
      setLoading(false);
      return;
    }

    try {
      const trackingId = generateTrackingId();

      // Create order with tracking ID
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            tracking_id: trackingId,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_address: customerInfo.address,
            total_amount: calculateTotal(),
            status: 'pending',
            order_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = Object.entries(cart).map(([plantId, quantity]) => {
        const plant = plants.find(p => p.id === plantId);
        if (!plant) throw new Error(`Plant with ID ${plantId} not found`);

        return {
          order_id: orderData.id,
          plant_id: plantId,
          quantity: quantity,
          price_at_time: plant.price
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock quantities
      for (const [plantId, quantity] of Object.entries(cart)) {
        const plant = plants.find(p => p.id === plantId);
        if (!plant) throw new Error(`Plant with ID ${plantId} not found`);

        const newQuantity = plant.stock_quantity - quantity;

        const { error: updateError } = await supabase
          .from('plants')
          .update({ stock_quantity: newQuantity })
          .eq('id', plantId);

        if (updateError) throw updateError;
      }

      // Set order tracking information
      setOrderTracking({
        trackingId,
        orderId: orderData.id,
        customerName: customerInfo.name
      });

      // Reset form
      setCustomerInfo({
        name: '',
        email: '',
        address: ''
      });

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderTracking) {
    return (
      <Box p={{ xs: 2, md: 4 }} maxWidth="800px" mx="auto">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              bgcolor: theme.palette.success.main,
              color: 'white',
              textAlign: 'center'
            }}
          >
            <CheckIcon sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Order Placed Successfully!
            </Typography>
            <Typography variant="h6">
              Thank you for your order, {orderTracking.customerName}!
            </Typography>
          </Box>

          {/* Order Details */}
          <Box sx={{ p: 4 }}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ReceiptIcon color="primary" />
                  <Typography variant="h6" fontWeight="medium">
                    Order Information
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {orderTracking.orderId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tracking ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {orderTracking.trackingId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Status
                    </Typography>
                    <Chip
                      icon={<ShippingIcon />}
                      label="Processing"
                      color="primary"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Track Your Order
            </Typography>

            <Typography variant="body1" paragraph>
              You can track your order status at any time using the link below:
            </Typography>

            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                mb: 3
              }}
            >
              <Link
                href={`/track-order/${orderTracking.trackingId}`}
                target="_blank"
                rel="noopener"
                sx={{ wordBreak: 'break-all' }}
              >
                {window.location.origin}/track-order/{orderTracking.trackingId}
              </Link>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              A confirmation email has been sent to your email address with all the order details.
            </Typography>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={onOrderComplete}
                startIcon={<CartIcon />}
              >
                Return to Catalog
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Get cart items with plant details
  const cartItems = Object.entries(cart).map(([plantId, quantity]) => {
    const plant = plants.find(p => p.id === plantId);
    return { plant, quantity };
  }).filter(item => item.plant && item.quantity > 0);

  const totalAmount = calculateTotal();

  return (
    <Box p={{ xs: 2, md: 4 }} maxWidth="1200px" mx="auto">
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.primary.main,
            color: 'white'
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Checkout
          </Typography>
          <Typography variant="subtitle1">
            Complete your order
          </Typography>
        </Box>

        <ErrorMessage message={error} />

        <Grid container>
          {/* Order Summary */}
          <Grid item xs={12} md={5} sx={{
            p: 3,
            borderRight: { md: `1px solid ${theme.palette.divider}` },
            bgcolor: 'background.default'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Order Summary
            </Typography>

            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map(({ plant, quantity }) => plant && (
                    <TableRow key={plant.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            src={plant.thumbnail_url || plant.image_url || getPlaceholderImage()}
                            alt={plant.name}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 1,
                              mr: 1
                            }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              e.currentTarget.src = getPlaceholderImage();
                            }}
                          />
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {plant.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{quantity}</TableCell>
                      <TableCell align="right">₹{(plant.price * quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ₹{totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Estimated Delivery
              </Typography>
              <Typography variant="body2">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          {/* Customer Information Form */}
          <Grid item xs={12} md={7} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Customer Information
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    required
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    required
                    variant="outlined"
                    helperText="We'll send order confirmation to this email"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Shipping Address"
                    multiline
                    rows={3}
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    required
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Total: ₹{totalAmount.toFixed(2)}
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                      Processing...
                    </>
                  ) : 'Place Order'}
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Order;
