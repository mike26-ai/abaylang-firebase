
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## 🚀 Production Deployment Guide

**IMPORTANT:** For your application to work in a live hosting environment, you must complete the following configuration steps. These are not required for local development but are essential for production.

### 1. Create Secrets in Google Cloud Secret Manager

Your application's server-side functions require secret keys. These are stored in your `.env` file locally but **must be configured securely** in your hosting provider's environment. This project uses **Firebase App Hosting**, which is configured via `apphosting.yaml` to read secrets directly from **Google Cloud Secret Manager**.

**You must create the following secrets:**
1.  Go to the Google Cloud Secret Manager console for your project.
2.  Create secrets with the following **exact names**:
    *   `ADMIN_FIREBASE_PROJECT_ID`
    *   `ADMIN_FIREBASE_CLIENT_EMAIL`
    *   `ADMIN_FIREBASE_PRIVATE_KEY`
    *   `PADDLE_API_KEY`
    *   `PADDLE_WEBHOOK_SECRET`

**Optional Secrets for Image Uploads:**
To enable users to upload images (e.g., for testimonials), you also need to create these secrets. If you don't need this feature, you can skip this step.
*   `CLOUDINARY_API_KEY`
*   `CLOUDINARY_API_SECRET`

**To generate Firebase Admin credentials:**
1.  Go to your Firebase Console -> Project Settings -> Service accounts.
2.  Click "Generate new private key". A JSON file will be downloaded.
3.  Use the `project_id`, `client_email`, and `private_key` from this file to create the secrets above. Remember to replace newline characters in the private key with `\n` if required by your terminal, or paste the multi-line key directly in the Google Cloud UI.

### 2. Grant App Hosting Access to Secrets (One-Time Setup)

For your live application to read the secrets you just created, you must grant it permission. This is a **one-time setup**.

1.  Go to the **IAM & Admin** page in your Google Cloud Console.
2.  Find the principal (service account) that ends with **`@firebaseapphosting.gserviceaccount.com`**. This is your App Hosting service account.
3.  Click the pencil icon to edit its roles.
4.  Add the **"Secret Manager Secret Accessor"** role.
5.  Save the changes.

Once this is done, every new deployment will automatically and securely have access to your secrets. You do not need to do this again.

### 3. Deploy Firestore Rules and Indexes

Your local Firestore rules and indexes are not automatically deployed. You must deploy them to your production Firebase project.

*   **Security Rules:** The `firestore.rules` file contains the security logic for your database.
*   **Indexes:** The `firestore.indexes.json` file contains the database indexes required for complex queries to function.

**To Deploy:** Use the Firebase CLI from your terminal:
```bash
# This command deploys both rules and indexes
firebase deploy --only firestore
```
Alternatively, you can copy the contents of each file into the "Rules" and "Indexes" tabs in the Firestore section of your Firebase Console.

### 4. Configure Client-Side Environment Variables

Ensure the public environment variables used by the client-side of your application are set in your hosting environment. For App Hosting, these are configured in `apphosting.yaml`.

*   `NEXT_PUBLIC_ADMIN_EMAIL`
*   `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

**Optional for Image Uploads:**
*   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
*   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---

## External Media Uploads (Cloudinary)

This project is configured to use an external service (Cloudinary) for all media uploads (images, videos, etc.), decoupling it from Firebase Storage. This feature is **optional**. If you do not configure the Cloudinary environment variables, the image upload functionality will be gracefully disabled without causing errors.

### How It Works

1.  **Configuration**: All Cloudinary settings are managed in your environment variables. See the "Production Deployment Guide" for setup instructions.
2.  **Upload Logic**: File uploads are handled by a Next.js Server Action located in `src/app/actions/uploadActions.ts`.
3.  **Storage**: The URL returned by Cloudinary is then stored as a simple string in your Firestore documents (e.g., in a `testimonials` document).
