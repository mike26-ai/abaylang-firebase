// File: src/app/api/bookings/service.ts
/**
 * NOTE: This file is deprecated and no longer used for the booking creation process.
 * The logic has been consolidated into the `/api/bookings/create/route.ts` file
 * for improved clarity, security, and maintainability.
 * This file is kept temporarily to avoid breaking potential imports but should be
 * removed in a future cleanup.
 */
import { getFirestore } from 'firebase-admin/firestore';
const db = getFirestore();
// All logic has been moved to the API route handler.
