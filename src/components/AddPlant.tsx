import React, { useState, useRef } from 'react';
import { supabase } from '../supabase/config';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ErrorMessage from './ErrorMessage';
import { Plant, PlantData } from '../types';
import { createThumbnail, isImageFile } from '../utils/imageUtils';
import { uploadImage, uploadDataUrl } from '../utils/storageUtils';

interface AddPlantProps {
  open: boolean;
  handleClose: () => void;
  onPlantAdded: (plant: Plant) => void;
}

const AddPlant: React.FC<AddPlantProps> = ({ open, handleClose, onPlantAdded }) => {
  const [plantData, setPlantData] = useState<PlantData>({
    name: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    thumbnail_url: '',
    description: '',
    category: '',
    imageFile: null
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  // Reference to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Plant categories
  const categories = [
    'Indoor Plants',
    'Outdoor Plants',
    'Flowering Plants',
    'Succulents',
    'Herbs',
    'Fruit Plants',
    'Vegetable Plants',
    'Bonsai',
    'Cacti',
    'Ferns'
  ];

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!isImageFile(file)) {
      setError('Please select a valid image file');
      return;
    }

    try {
      setUploadProgress(true);

      // Create a thumbnail
      const thumbnailDataUrl = await createThumbnail(file, 200, 200);

      // Set previews
      const fullImageUrl = URL.createObjectURL(file);
      setImagePreview(fullImageUrl);
      setThumbnailPreview(thumbnailDataUrl);

      // Update plant data
      setPlantData({
        ...plantData,
        imageFile: file
      });

      setUploadProgress(false);
    } catch (error: any) {
      setError(`Error processing image: ${error.message}`);
      setUploadProgress(false);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = plantData.image_url;
      let thumbnailUrl = plantData.thumbnail_url;

      // Upload image if a file was selected
      if (plantData.imageFile) {
        setUploadProgress(true);

        try {
          console.log('Uploading full-size image...');
          // Upload the full-size image
          imageUrl = await uploadImage(plantData.imageFile, 'plants', 'images');
          console.log('Full-size image uploaded successfully:', imageUrl);

          // Upload the thumbnail
          if (thumbnailPreview) {
            console.log('Uploading thumbnail...');
            thumbnailUrl = await uploadDataUrl(thumbnailPreview, 'plants', 'thumbnails');
            console.log('Thumbnail uploaded successfully:', thumbnailUrl);
          }
        } catch (uploadError: any) {
          console.error('Error during image upload:', uploadError);
          setError(`Error uploading image: ${uploadError.message}`);
          setLoading(false);
          setUploadProgress(false);
          return; // Exit early if image upload fails
        }

        setUploadProgress(false);
      }

      // Insert the plant data into the database
      const { data, error } = await supabase
        .from('plants')
        .insert([{
          name: plantData.name,
          price: parseFloat(plantData.price),
          stock_quantity: parseInt(plantData.stock_quantity),
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl || imageUrl, // Use the full image URL if no thumbnail
          description: plantData.description,
          category: plantData.category
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        onPlantAdded(data[0] as Plant);
        handleClose();

        // Reset form
        setPlantData({
          name: '',
          price: '',
          stock_quantity: '',
          image_url: '',
          thumbnail_url: '',
          description: '',
          category: '',
          imageFile: null
        });
        setImagePreview(null);
        setThumbnailPreview(null);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Plant</DialogTitle>
      <DialogContent sx={{ maxWidth: 600 }}>
        <ErrorMessage message={error} />

        <Grid container spacing={2}>
          {/* Left column - Image upload */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: '1px dashed #ccc',
                borderRadius: 1,
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                position: 'relative'
              }}
            >
              {uploadProgress ? (
                <CircularProgress />
              ) : imagePreview ? (
                <Card sx={{ width: '100%', mb: 1 }}>
                  <CardMedia
                    component="img"
                    image={imagePreview}
                    alt="Plant preview"
                    sx={{ height: 200, objectFit: 'contain' }}
                  />
                </Card>
              ) : (
                <AddPhotoAlternateIcon sx={{ fontSize: 60, color: '#ccc', mb: 1 }} />
              )}

              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              <Button
                variant="outlined"
                onClick={handleBrowseClick}
                disabled={uploadProgress}
                sx={{ mt: 1 }}
              >
                {imagePreview ? 'Change Image' : 'Browse Image'}
              </Button>

              {thumbnailPreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ mb: 1 }}>
                    Thumbnail Preview
                  </Typography>
                  <Box
                    component="img"
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      border: '1px solid #eee',
                      borderRadius: 1
                    }}
                  />
                </Box>
              )}
            </Box>

            <TextField
              margin="dense"
              label="Image URL (Optional if uploading)"
              fullWidth
              value={plantData.image_url}
              onChange={(e) => setPlantData({...plantData, image_url: e.target.value})}
              helperText="You can either upload an image or provide a URL"
            />
          </Grid>

          {/* Right column - Plant details */}
          <Grid item xs={12} md={6}>
            <TextField
              autoFocus
              margin="dense"
              label="Plant Name"
              fullWidth
              value={plantData.name}
              onChange={(e) => setPlantData({...plantData, name: e.target.value})}
              required
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={plantData.category || ''}
                label="Category"
                onChange={(e) => setPlantData({...plantData, category: e.target.value})}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={plantData.price}
              onChange={(e) => setPlantData({...plantData, price: e.target.value})}
              required
            />

            <TextField
              margin="dense"
              label="Stock Quantity"
              type="number"
              fullWidth
              value={plantData.stock_quantity}
              onChange={(e) => setPlantData({...plantData, stock_quantity: e.target.value})}
              required
            />
          </Grid>

          {/* Full width - Description */}
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={plantData.description || ''}
              onChange={(e) => setPlantData({...plantData, description: e.target.value})}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading || uploadProgress}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || uploadProgress}
          variant="contained"
          color="primary"
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Adding...
            </>
          ) : 'Add Plant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPlant;
