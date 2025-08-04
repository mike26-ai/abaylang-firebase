# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## External Media Uploads (Cloudinary)

This project is configured to use an external service (Cloudinary) for all media uploads (images, videos, etc.), decoupling it from Firebase Storage.

### How It Works

1.  **Configuration**: All Cloudinary settings are managed in your environment variables (`.env` file). You must set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
2.  **Upload Logic**: File uploads are handled by a Next.js Server Action located in `src/app/actions/uploadActions.ts`. This action takes a `FormData` object containing the file and sends it directly to the Cloudinary API.
3.  **Usage**: To upload a file from a client component, import and call the `uploadImage` server action. It will return the secure URL of the uploaded file.
4.  **Storage**: The URL returned by Cloudinary is then stored as a simple string in your Firestore documents (e.g., in a user's profile or a testimonial document).

### Switching Providers

This system is modular. To switch to a different provider (e.g., UploadThing):

1.  Create a new Server Action (e.g., `uploadToUploadThing`).
2.  Update the components that call the upload action to use your new function.
3.  Update your environment variables with the new service's credentials.
