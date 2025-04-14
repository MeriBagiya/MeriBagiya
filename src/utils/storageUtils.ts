import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';
import { dataUrlToBlob } from './imageUtils';

/**
 * Uploads an image file to Supabase storage
 * @param file The image file to upload
 * @param bucket The storage bucket to upload to
 * @param folder The folder within the bucket to upload to
 * @returns A promise that resolves to the URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'plants',
  folder: string = 'images'
): Promise<string> => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Ensure the bucket exists
    await ensureBucketExists(bucket);

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      // If the error is about the bucket not existing, try to create it and retry
      if (error.message && error.message.includes('bucket') && error.message.includes('not found')) {
        console.log(`Bucket ${bucket} not found, attempting to create it...`);
        await createBucket(bucket);

        // Retry the upload
        const retryResult = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (retryResult.error) {
          throw retryResult.error;
        }
      } else {
        throw error;
      }
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Uploads a data URL to Supabase storage
 * @param dataUrl The data URL to upload
 * @param bucket The storage bucket to upload to
 * @param folder The folder within the bucket to upload to
 * @param fileName Optional file name (will generate a UUID if not provided)
 * @returns A promise that resolves to the URL of the uploaded image
 */
export const uploadDataUrl = async (
  dataUrl: string,
  bucket: string = 'plants',
  folder: string = 'thumbnails',
  fileName?: string
): Promise<string> => {
  try {
    // Convert data URL to Blob
    const blob = dataUrlToBlob(dataUrl);

    // Generate a unique file name if not provided
    if (!fileName) {
      fileName = `${uuidv4()}.jpg`;
    }

    const filePath = `${folder}/${fileName}`;

    // Ensure the bucket exists
    await ensureBucketExists(bucket);

    // Upload the blob
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob);

    if (error) {
      // If the error is about the bucket not existing, try to create it and retry
      if (error.message && error.message.includes('bucket') && error.message.includes('not found')) {
        console.log(`Bucket ${bucket} not found, attempting to create it...`);
        await createBucket(bucket);

        // Retry the upload
        const retryResult = await supabase.storage
          .from(bucket)
          .upload(filePath, blob);

        if (retryResult.error) {
          throw retryResult.error;
        }
      } else {
        throw error;
      }
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading data URL:', error);
    throw error;
  }
};

/**
 * Ensures that a bucket exists, creating it if necessary
 * @param bucketName The name of the bucket to check/create
 */
const ensureBucketExists = async (bucketName: string): Promise<void> => {
  try {
    // Check if the bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error checking buckets:', error);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      await createBucket(bucketName);
    }
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
  }
};

/**
 * Creates a new storage bucket
 * @param bucketName The name of the bucket to create
 */
const createBucket = async (bucketName: string): Promise<void> => {
  try {
    console.log(`Creating bucket: ${bucketName}`);

    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
      console.error(`Error creating ${bucketName} bucket:`, error);
    } else {
      console.log(`${bucketName} bucket created successfully`);
    }
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error);
  }
};
