// File: src/app/actions/uploadActions.ts
'use server';

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// NOTE: Cloudinary config is now moved inside the function to avoid server
// startup errors if environment variables are not set.

/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * This function now conditionally handles uploads. If any Cloudinary variables 
 * are missing, it will gracefully skip the upload without causing an error.
 * @param formData - The FormData object containing the file to upload.
 * @returns An object with either the secure URL of the uploaded image or an error message.
 */
export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string; skipped?: boolean }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Gracefully handle missing configuration. This makes the feature entirely optional.
  if (!cloudName || !uploadPreset || !apiKey || !apiSecret) {
    console.warn(`
      ********************************************************************************
      Cloudinary environment variables are not fully configured. 
      This is not an error. The image upload feature is optional.
      To enable uploads, please configure all four Cloudinary variables in your 
      .env file and hosting environment:
      - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      - CLOUDINARY_API_KEY
      - CLOUDINARY_API_SECRET
      ********************************************************************************
    `);
    // Return a success state indicating the upload was skipped, not failed.
    return { success: true, url: undefined, skipped: true };
  }
  
  // Configure Cloudinary only when we are sure all variables are present.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  // Convert the file to a buffer to upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          upload_preset: uploadPreset,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary upload failed: The result is undefined."));
            return;
          }
          resolve(result);
        }
      ).end(buffer);
    });

    return { success: true, url: result.secure_url };

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return { success: false, error: 'Failed to upload image.' };
  }
}
