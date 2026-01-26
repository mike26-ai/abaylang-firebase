
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## 🚀 Production Deployment Guide

**IMPORTANT:** For your application to work in a live hosting environment, you must complete the following configuration steps. These are not required for local development but are essential for production.

### 1. Configure Server-Side Environment Variables (Secrets)

Your application's server-side functions (like creating bookings and processing payments) require secret keys. These are stored in your `.env` file locally but **must be configured securely** in your hosting provider's environment.

This project uses **Firebase App Hosting**, which is configured via `apphosting.yaml`. This file is set up to read secrets from **Google Cloud Secret Manager**.

**You must create the following secrets in Google Cloud Secret Manager:**

*   `ADMIN_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
*   `ADMIN_FIREBASE_CLIENT_EMAIL`: The client email from your Firebase service account JSON key.
*   `ADMIN_FIREBASE_PRIVATE_KEY`: The private key from your Firebase service account JSON key.
*   `PADDLE_API_KEY`: Your Paddle API secret key.
*   `PADDLE_WEBHOOK_SECRET`: Your Paddle webhook signing secret.
*   `CLOUDINARY_API_KEY`: Your Cloudinary API key for image uploads.
*   `CLOUDINARY_API_SECRET`: Your Cloudinary API secret for image uploads.

**To generate Firebase Admin credentials:**
1.  Go to your Firebase Console -> Project Settings -> Service accounts.
2.  Click "Generate new private key". A JSON file will be downloaded.
3.  Use the `project_id`, `client_email`, and `private_key` from this file to create the secrets above.

### 2. Deploy Firestore Rules and Indexes

Your local Firestore rules and indexes are not automatically deployed. You must deploy them to your production Firebase project.

*   **Security Rules:** The `firestore.rules` file contains the security logic for your database.
*   **Indexes:** The `firestore.indexes.json` file contains the database indexes required for complex queries to function.

**To Deploy:** Use the Firebase CLI from your terminal:
```bash
# This command deploys both rules and indexes
firebase deploy --only firestore
```
Alternatively, you can copy the contents of each file into the "Rules" and "Indexes" tabs in the Firestore section of your Firebase Console.

### 3. Configure Client-Side Environment Variables

Ensure the public environment variables used by the client-side of your application are set in your hosting environment. For App Hosting, these are configured in `apphosting.yaml`.

*   `NEXT_PUBLIC_ADMIN_EMAIL`
*   `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
*   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
*   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---

## External Media Uploads (Cloudinary)

This project is configured to use an external service (Cloudinary) for all media uploads (images, videos, etc.), decoupling it from Firebase Storage.

### How It Works

1.  **Configuration**: All Cloudinary settings are managed in your environment variables.
2.  **Upload Logic**: File uploads are handled by a Next.js Server Action located in `src/app/actions/uploadActions.ts`.
3.  **Storage**: The URL returned by Cloudinary is then stored as a simple string in your Firestore documents.
