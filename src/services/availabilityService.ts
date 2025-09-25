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
 * Fetches availability data for a specific tutor on a given date via a secure API route.
 * @param date - The date for which to fetch availability, as a YYYY-MM-DD string.
 * @returns An object containing arrays of bookings and time-off blocks.
 */
export async function getAvailability(date: string): Promise<AvailabilityResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/get?date=${date}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server response error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch availability data.');
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('Fetch availability error:', err);
    // Re-throw the error so the calling component can handle it (e.g., show a toast).
    throw new Error('A network error occurred while fetching availability data.');
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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to block time slot.');
  }
  return response.json();
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

  if (!response.ok) {
     const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to unblock time slot.');
  }
  return response.json();
}
