
// File: src/services/availabilityService.ts

import { auth } from "@/lib/firebase";
import type { Booking, TimeOff } from "@/lib/types";
import { format } from "date-fns";

// The base URL for our API routes, which will adapt to the environment.
const API_BASE_URL = '/api';

interface AvailabilityResponse {
  bookings: Booking[];
  timeOff: TimeOff[];
}

// --- CLIENT-SIDE FUNCTIONS ---

/**
 * Fetches availability data for the tutor on a given date via a secure API route.
 * @param date - The date for which to fetch availability.
 * @returns An object containing arrays of bookings and time-off blocks.
 */
export async function getAvailability(date: Date): Promise<AvailabilityResponse> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    try {
        const response = await fetch(`${API_BASE_URL}/availability/get?date=${formattedDate}`);
        
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            console.error("Server responded with an error:", response.status, errorBody);
            throw new Error(errorBody.error || `Failed to fetch availability: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            console.error('Server logic error:', result);
            throw new Error(result.error || 'Failed to retrieve availability data from the server.');
        }

        // Safely access data, providing default empty arrays if data is missing.
        return {
            bookings: result.data?.bookings || [],
            timeOff: result.data?.timeOff || [],
        };
    } catch (err: any) {
        console.error('Network or parsing error in getAvailability:', err);
        // Re-throw a standardized error so the calling component can handle it.
        throw new Error(`Could not fetch schedule. Please check your connection and try again. Details: ${err.message}`);
    }
}


interface BlockSlotPayload {
  tutorId: string;
  startISO: string;
  endISO: string;
  note?: string;
}

/**
 * Sends a request to the server to block a new time slot.
 * Requires admin authentication. An ID token is automatically retrieved and sent.
 * @param payload - The data for the time slot to block.
 * @returns The newly created time-off document.
 */
export async function blockSlot(payload: BlockSlotPayload): Promise<TimeOff> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required to block a time slot.");
  }
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/availability/block`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to block time slot.');
  }
  return result.data;
}

interface UnblockSlotPayload {
  timeOffId: string;
}

/**
 * Sends a request to the server to unblock (delete) a time-off slot.
 * Requires authentication from an admin or the user who created the block.
 * @param payload - The ID of the time-off block to remove.
 * @returns A success message.
 */
export async function unblockSlot(payload: UnblockSlotPayload): Promise<{ message: string }> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required to unblock a time slot.");
  }
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/availability/unblock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to unblock time slot.');
  }
  return result.data;
}
