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

## Firestore Security Rules & Indexes

For the application to function correctly and securely, you must deploy the provided Firestore rules and create specific composite indexes in your Firebase Console.

### Security Rules

A `firestore.rules` file is included in the repository. You must deploy these rules to your Firebase project to protect user data. The key rules are:
-   **Users**: Can only edit their own profile.
-   **Bookings**: Can only be created, read, or updated by the user who owns them.
-   **TimeOff**: Can only be created, updated, or deleted by an administrator.
-   **Testimonials**: Can only be approved or rejected by an administrator.

**To Deploy:** Use the Firebase CLI (`firebase deploy --only firestore:rules`) or copy the contents of `firestore.rules` into the Rules tab of the Firestore section in the Firebase Console.

### Composite Indexes

For the application's queries to work efficiently, you will need to manually create the following composite indexes in your Firebase Console. The application may prompt you with a direct link to create these if they are missing.

1.  **Bookings Collection Index:**
    *   **Collection:** `bookings`
    *   **Fields:** `date` (Ascending), `tutorId` (Ascending), `status` (Ascending)
    *   **Query Scope:** Collection
    *   **Purpose:** This index is essential for efficiently fetching available and booked time slots for a specific tutor on a given date, ensuring the booking calendar loads quickly and accurately.

2.  **TimeOff Collection Index:**
    *   **Collection:** `timeOff`
    *   **Fields:** `date` (Ascending), `tutorId` (Ascending)
    *   **Query Scope:** Collection
    *   **Purpose:** This index allows the system to quickly retrieve all the time-off blocks for a tutor on a specific date, which is necessary for displaying the tutor's availability correctly.
