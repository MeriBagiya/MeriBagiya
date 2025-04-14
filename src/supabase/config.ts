import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl: string | undefined = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey: string | undefined = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if environment variables are defined
// We'll use empty strings as fallbacks if they're not defined

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Initialize storage buckets
export const initializeStorage = async (): Promise<void> => {
  try {
    console.log('Initializing Supabase storage buckets...');

    // Check if plants bucket exists, if not create it
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error checking buckets:', error);
      // If we can't list buckets, we'll try to create them anyway
    }

    const bucketNames = ['plants'];
    const existingBuckets = buckets ? buckets.map(bucket => bucket.name) : [];

    console.log('Existing buckets:', existingBuckets);

    // Create each bucket if it doesn't exist
    for (const bucketName of bucketNames) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`Creating bucket: ${bucketName}`);

        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });

        if (createError) {
          console.error(`Error creating ${bucketName} bucket:`, createError);
        } else {
          console.log(`${bucketName} bucket created successfully`);

          // Set bucket to public
          const { error: policyError } = await supabase.storage.from(bucketName).createSignedUrl('dummy.txt', 60);
          if (policyError) {
            console.log(`Note: ${policyError.message} - This is expected if the file doesn't exist`);
          }
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
    }

    console.log('Storage initialization completed');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Call initialize storage
initializeStorage();

// Supabase client is now ready to use
