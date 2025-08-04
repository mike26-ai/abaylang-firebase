// File: src/app/actions/uploadActions.ts
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials.
// It's safe to do this here because this is a server-side action.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  // For signed uploads, you would also need api_key and api_secret.
  // For this unsigned approach, these are not required.
  // api_key: process.env.CLOUDINARY_API_KEY,
  // api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * @param formData - The FormData object containing the file to upload.
 * @returns An object with either the secure URL of the uploaded image or an error message.
 */
export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  // Convert the file to a buffer to upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    return { success: false, error: 'Cloudinary upload preset is not configured.' };
  }

  try {
    const result = await new Promise((resolve, reject) => {
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
          resolve(result);
        }
      ).end(buffer);
    }) as { secure_url: string };

    return { success: true, url: result.secure_url };

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return { success: false, error: 'Failed to upload image.' };
  }
}
