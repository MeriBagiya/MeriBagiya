import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Box,
  Button,
  Skeleton,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Container,
  Paper,
  Divider,
  useTheme,
  alpha,
  InputBase
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Spa as EcoIcon
} from '@mui/icons-material';
import AddPlant from './AddPlant';
import { Plant, Cart } from '../types';
import { getPlaceholderImage } from '../utils/imageUtils';

const ITEMS_PER_PAGE = 6; // Number of plants to load at once
const SKELETON_COUNT = 6; // Match this with the number of plants in your database

const PlantSkeleton: React.FC = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" height={32} animation="wave" />
      <Skeleton variant="text" width="40%" animation="wave" />
      <Skeleton variant="text" width="60%" animation="wave" />
      <Box mt={2}>
        <Skeleton variant="rectangular" height={40} width="100%" animation="wave" />
      </Box>
    </CardContent>
  </Card>
);

interface PlantsProps {
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  cart: Cart;
  setPlants: React.Dispatch<React.SetStateAction<Plant[]>>;
  plants: Plant[];
  isAdmin?: boolean;
}

const Plants: React.FC<PlantsProps> = ({ setCart, cart, setPlants, plants, isAdmin = false }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchPlants = async () => {
      try {
        setLoading(true);
        const { data, error, count } = await supabase
          .from('plants')
          .select('*', { count: 'exact' })
          .order('name')
          .range(0, ITEMS_PER_PAGE - 1);

        if (!isMounted) return;

        if (error) throw error;

        setPlants(data as Plant[]);
        setHasMore(count !== null && count > data.length);
        setError(null);
      } catch (error: any) {
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlants();

    return () => {
      isMounted = false;
    };
  }, [setPlants]); // Include setPlants in the dependency array

  const loadMore = async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const start = nextPage * ITEMS_PER_PAGE;

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('name')
        .range(start, start + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setPlants(prev => [...prev, ...(data as Plant[])]);
      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage(nextPage);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleQuantityChange = (plantId: string, quantity: string) => {
    setCart(prev => ({
      ...prev,
      [plantId]: parseInt(quantity) || 0
    }));
  };

  const handleAddPlant = (newPlant: Plant) => {
    setPlants(prev => [newPlant, ...prev]);
  };

  if (loading) {
    return (
      <>
        <Box display="flex" justifyContent="flex-end" p={3}>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={true}
            >
              Add Plant
            </Button>
          )}
        </Box>
        <Grid container spacing={3} padding={3}>
          {[...Array(SKELETON_COUNT)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <PlantSkeleton />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          Error loading plants: {error}
        </Alert>
      </Box>
    );
  }

  // Filter plants based on search term
  const filteredPlants = plants.filter(plant =>
    searchTerm ? plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (plant.category && plant.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (plant.description && plant.description.toLowerCase().includes(searchTerm.toLowerCase()))
              : true
  );

  return (
    <>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: { xs: 0, md: '0 0 20px 20px' },
          boxShadow: 3
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Plant Catalog
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.8 }}>
            Discover our collection of beautiful plants for your home and garden
          </Typography>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', md: '60%' },
              bgcolor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.25),
              },
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.common.white, 0.25)
            }}
          >
            <IconButton sx={{ p: '10px', color: 'white' }}>
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, color: 'white' }}
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputProps={{ 'aria-label': 'search plants' }}
            />
            {searchTerm && (
              <IconButton
                sx={{ p: '10px', color: 'white' }}
                onClick={() => setSearchTerm('')}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Admin Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h5" fontWeight="medium">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Plants'}
            {searchTerm && ` (${filteredPlants.length} results)`}
          </Typography>

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Plant
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
        {filteredPlants && filteredPlants.length > 0 ? (
          filteredPlants.map(plant => (
            <Grid item xs={12} sm={6} md={4} key={plant.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  },
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={plant.thumbnail_url || plant.image_url}
                    alt={plant.name}
                    sx={{
                      cursor: 'pointer',
                      objectFit: 'cover',
                    }}
                    onClick={() => {
                      setSelectedImage(plant.image_url);
                      setSelectedPlant(plant);
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = getPlaceholderImage();
                      e.currentTarget.classList.add('placeholder-image');
                    }}
                  />
                  {plant.category && (
                    <Chip
                      label={plant.category}
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 'medium',
                        bgcolor: alpha(theme.palette.primary.main, 0.85)
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {plant.name}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      fontWeight="bold"
                    >
                      ₹{plant.price}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: plant.stock_quantity > 0 ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      <EcoIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      {plant.stock_quantity > 0 ? `In Stock: ${plant.stock_quantity}` : 'Out of Stock'}
                    </Typography>
                  </Box>

                  {plant.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plant.description.length > 100
                        ? `${plant.description.substring(0, 100)}...`
                        : plant.description}
                    </Typography>
                  )}

                  <Box mt={2}>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={cart[plant.id] || ''}
                      onChange={(e) => handleQuantityChange(plant.id, e.target.value)}
                      InputProps={{
                        inputProps: {
                          min: 0,
                          max: plant.stock_quantity
                        }
                      }}
                      size="small"
                      fullWidth
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No plants available. {isAdmin && 'Add some plants using the button above!'}
            </Typography>
          </Grid>
        )}
      </Grid>
      </Container>
      {hasMore && (
        <Box display="flex" justifyContent="center" p={3}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading...
              </>
            ) : (
              'Load More Plants'
            )}
          </Button>
        </Box>
      )}
      <AddPlant
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        onPlantAdded={handleAddPlant}
      />

      {/* Plant Details Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => {
          setSelectedImage(null);
          setSelectedPlant(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        {selectedPlant && (
          <>
            {/* Header */}
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Plant Details
              </Typography>
              <IconButton
                sx={{ color: 'white' }}
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedPlant(null);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
              <Grid container>
                {/* Left side - Image */}
                <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                      p: 2
                    }}
                  >
                    <img
                      src={selectedImage || ''}
                      alt={selectedPlant.name}
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = getPlaceholderImage();
                        e.currentTarget.classList.add('placeholder-image');
                      }}
                    />
                  </Box>
                </Grid>

                {/* Right side - Details */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {selectedPlant.name}
                    </Typography>

                    {selectedPlant.category && (
                      <Chip
                        label={selectedPlant.category}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Typography
                      variant="h5"
                      color="primary.main"
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      ₹{selectedPlant.price}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography
                      variant="subtitle1"
                      fontWeight="medium"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: selectedPlant.stock_quantity > 0 ? 'success.main' : 'error.main',
                        mb: 2
                      }}
                    >
                      <EcoIcon sx={{ mr: 1 }} />
                      {selectedPlant.stock_quantity > 0
                        ? `In Stock: ${selectedPlant.stock_quantity} available`
                        : 'Out of Stock'}
                    </Typography>

                    {selectedPlant.description && (
                      <>
                        <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ mt: 3 }}>
                          Description
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                          {selectedPlant.description}
                        </Typography>
                      </>
                    )}

                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Quantity
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                          type="number"
                          value={cart[selectedPlant.id] || ''}
                          onChange={(e) => handleQuantityChange(selectedPlant.id, e.target.value)}
                          InputProps={{
                            inputProps: {
                              min: 0,
                              max: selectedPlant.stock_quantity
                            }
                          }}
                          size="small"
                          sx={{ width: 100 }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={selectedPlant.stock_quantity <= 0}
                          startIcon={<CartIcon />}
                          onClick={() => {
                            if (!cart[selectedPlant.id]) {
                              handleQuantityChange(selectedPlant.id, '1');
                            }
                          }}
                        >
                          Add to Cart
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Plants;


