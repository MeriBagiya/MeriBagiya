import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase/config';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Link,
  useTheme
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import ErrorMessage from './ErrorMessage';
import { OrderSchema, formatZodError } from '../schemas';
import type { Order as OrderWithItems } from '../schemas';
import { getPlaceholderImage } from '../utils/imageUtils';

const orderStatuses: ('pending' | 'processing' | 'shipped' | 'delivered')[] = ['pending', 'processing', 'shipped', 'delivered'];

// In React Router v6, useParams returns a Record<string, string | undefined>
const OrderTracking: React.FC = () => {
  // Using type assertion for React Router v6
  const params = useParams();
  const trackingId = params.trackingId;
  const [orderDetails, setOrderDetails] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const fetchOrderDetails = async (): Promise<void> => {
    try {
      if (!trackingId) {
        throw new Error('No tracking ID provided');
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            plants (
              *
            )
          )
        `)
        .eq('tracking_id', trackingId)
        .single();

      if (orderError) throw orderError;

      // Validate the order data using Zod
      const validationResult = OrderSchema.safeParse(orderData);
      if (!validationResult.success) {
        console.error('Order data validation failed:', validationResult.error);
        throw new Error(`Invalid order data: ${formatZodError(validationResult.error)}`);
      }

      setOrderDetails(validationResult.data);
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError('Order not found or invalid tracking ID');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !orderDetails) {
    return <ErrorMessage message={error || 'Order details not found'} />;
  }

  const activeStep = orderStatuses.indexOf(orderDetails.status);

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', icon: <TimeIcon />, label: 'Pending' };
      case 'processing':
        return { color: 'info', icon: <TimeIcon />, label: 'Processing' };
      case 'shipped':
        return { color: 'primary', icon: <ShippingIcon />, label: 'Shipped' };
      case 'delivered':
        return { color: 'success', icon: <CheckIcon />, label: 'Delivered' };
      default:
        return { color: 'default', icon: <TimeIcon />, label: status };
    }
  };

  const statusInfo = getStatusInfo(orderDetails.status);
  const orderDate = new Date(orderDetails.order_date);

  // Calculate estimated delivery date (just for display purposes)
  const estimatedDeliveryDate = new Date(orderDate);
  estimatedDeliveryDate.setDate(orderDate.getDate() + 7); // Add 7 days

  return (
    <Box p={{ xs: 2, md: 4 }} maxWidth="1200px" mx="auto">
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Catalog
      </Button>

      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Order Status
            </Typography>
            <Typography variant="subtitle1">
              Tracking ID: {orderDetails.tracking_id}
            </Typography>
          </Box>

          <Chip
            label={statusInfo.label}
            icon={statusInfo.icon}
            color={statusInfo.color as any}
            sx={{
              fontWeight: 'bold',
              mt: { xs: 2, sm: 0 },
              '& .MuiChip-icon': { color: 'inherit' }
            }}
          />
        </Box>

        {/* Stepper */}
        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {orderStatuses.map((label, index) => {
              const statusDate = new Date(orderDate);
              statusDate.setDate(orderDate.getDate() + index * 2); // Just for display

              return (
                <Step key={label}>
                  <StepLabel>
                    <Typography fontWeight="medium">
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </Typography>
                    {index <= activeStep && (
                      <Typography variant="caption" color="text.secondary">
                        {index === 0 ? 'Ordered' : ''}
                        {index === 1 ? 'Processing' : ''}
                        {index === 2 ? 'Shipped' : ''}
                        {index === 3 ? 'Delivered' : ''}
                        {index <= activeStep ? ` on ${statusDate.toLocaleDateString()}` : ''}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        <Divider />

        {/* Order and Customer Details */}
        <Grid container>
          {/* Order Details */}
          <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: `1px solid ${theme.palette.divider}` } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Order Details
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography>
                  {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Estimated Delivery
                </Typography>
                <Typography>
                  {estimatedDeliveryDate.toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography fontWeight="bold" color="primary.main">
                  ₹{orderDetails.total_amount.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Customer Details */}
          <Grid item xs={12} md={6} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Customer Details
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                  {orderDetails.customer_name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight="medium">
                    {orderDetails.customer_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography>
                  {orderDetails.customer_email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <HomeIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                <Typography>
                  {orderDetails.customer_address}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider />

        {/* Order Items */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Order Items
          </Typography>

          <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mt: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetails.order_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={item.plants?.thumbnail_url || item.plants?.image_url || getPlaceholderImage()}
                          alt={item.plants?.name}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mr: 2
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = getPlaceholderImage();
                          }}
                        />
                        <Box>
                          <Typography fontWeight="medium">
                            {item.plants?.name}
                          </Typography>
                          {item.plants?.category && (
                            <Chip
                              label={item.plants.category}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.price_at_time.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        ₹{(item.price_at_time * item.quantity).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right">
                    <Typography fontWeight="bold">Total</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="primary.main">
                      ₹{orderDetails.total_amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Thank you for shopping with us! If you have any questions about your order,
            please contact our customer service at <Link href="mailto:support@plantcatalog.com">support@plantcatalog.com</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderTracking;
