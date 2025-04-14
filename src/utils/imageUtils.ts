/**
 * Utility functions for image processing
 */

/**
 * Creates a thumbnail from an image file
 * @param file The image file to create a thumbnail from
 * @param maxWidth The maximum width of the thumbnail
 * @param maxHeight The maximum height of the thumbnail
 * @returns A promise that resolves to a data URL of the thumbnail
 */
export const createThumbnail = (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Calculate the new dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }

        // Create a canvas and draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Converts a file to a data URL
 * @param file The file to convert
 * @returns A promise that resolves to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validates if a file is an image
 * @param file The file to validate
 * @returns True if the file is an image, false otherwise
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Converts a data URL to a Blob
 * @param dataUrl The data URL to convert
 * @returns A Blob object
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

/**
 * Gets a placeholder image URL
 * @returns The URL of the placeholder image
 */
export const getPlaceholderImage = (): string => {
  return '/images/placeholder-plant.jpg';
};

/**
 * Checks if an image URL is valid and accessible
 * @param url The URL to check
 * @returns A promise that resolves to true if the image is valid, false otherwise
 */
export const isImageUrlValid = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      resolve(false);
    };

    img.src = url;
  });
};

/**
 * Gets a valid image URL or returns a placeholder
 * @param primaryUrl The primary URL to try
 * @param fallbackUrl The fallback URL to try if the primary fails
 * @returns A promise that resolves to a valid image URL or a placeholder
 */
export const getValidImageUrl = async (
  primaryUrl?: string,
  fallbackUrl?: string
): Promise<string> => {
  const placeholderUrl = getPlaceholderImage();

  if (!primaryUrl) {
    return placeholderUrl;
  }

  try {
    const isPrimaryValid = await isImageUrlValid(primaryUrl);
    if (isPrimaryValid) {
      return primaryUrl;
    }

    if (fallbackUrl) {
      const isFallbackValid = await isImageUrlValid(fallbackUrl);
      if (isFallbackValid) {
        return fallbackUrl;
      }
    }

    return placeholderUrl;
  } catch (error) {
    console.error('Error validating image URL:', error);
    return placeholderUrl;
  }
};
