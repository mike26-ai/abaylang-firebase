
// File: src/services/bookingService.ts
import { auth } from "@/lib/firebase";

// This file is no longer used for booking creation.
// The logic has been moved to the /api/bookings/create API route
// and its corresponding service file to ensure all booking creation
// logic is handled securely on the server.
// The client now calls the API route directly.
// This file is kept to prevent breaking imports but should be considered deprecated.
export async function createBooking() {
    console.warn("DEPRECATED: createBooking service on the client is no longer used.");
    throw new Error("Booking creation must be handled by the server API.");
}
