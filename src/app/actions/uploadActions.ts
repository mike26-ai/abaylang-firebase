// File: src/app/actions/uploadActions.ts
'use server';

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Configure Cloudinary with your credentials.
// It's safe to do this here because this is a server-side action.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * This function now conditionally handles uploads. If Cloudinary is not configured,
 * it will skip the upload and return a success state with no URL.
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

  // Gracefully handle missing configuration for development
  if (!cloudName || !uploadPreset) {
    console.warn(`
      ********************************************************************************
      Cloudinary environment variables (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and 
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) are not set. 
      Skipping image upload. The feature will work, but no image will be attached.
      To enable uploads, please configure these in your .env file.
      ********************************************************************************
    `);
    // Return a success state indicating the upload was skipped, not failed.
    return { success: true, url: undefined, skipped: true };
  }


  // Convert the file to a buffer to upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);


  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          upload_preset: uploadPreset,
          // You can add more options here, like tags, folders, etc.
          // folder: "amharic_connect_testimonials"
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          // FIX: Explicitly check for an undefined result before resolving.
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
