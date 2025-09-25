// File: src/services/availabilityService.ts

import { auth } from "@/lib/firebase";
import type { Booking, TimeOff } from "@/lib/types";
import { format } from "date-fns";
import {_getAvailability, _blockSlot, _unblockSlot} from "@/app/api/availability/service";


// The base URL for our API routes, which will adapt to the environment.
const API_BASE_URL = '/api';

interface AvailabilityResponse {
  bookings: Booking[];
  timeOff: TimeOff[];
}

/**
 * TESTABLE LOGIC (SERVER-SIDE)
 * This function contains the core logic for fetching availability and can be unit-tested.
 * It is called by the /api/availability/get route handler.
 */
export const getAvailabilityLogic = _getAvailability;


/**
 * TESTABLE LOGIC (SERVER-SIDE)
 * This function contains the core logic for blocking a slot and can be unit-tested.
 * It is called by the /api/availability/block route handler.
 *
 * @example
 * // How to test this function (e.g., using Jest):
 * jest.mock('firebase-admin/firestore');
 *
 * describe('blockSlotLogic', () => {
 *   it('should throw an error if a conflicting booking exists', async () => {
 *     // Mock Firestore to return a conflicting booking
 *     const conflictingBooking = { ... };
 *     firestore.collection().where().get.mockResolvedValue({ empty: false, docs: [conflictingBooking] });
 *
 *     // Expect the function to throw a specific error
 *     await expect(blockSlotLogic(...)).rejects.toThrow('slot_already_booked');
 *   });
 *
 *   it('should create a timeOff document if no conflict exists', async () => {
 *      // Mock Firestore to return no conflicting bookings
 *      firestore.collection().where().get.mockResolvedValue({ empty: true });
 *      const addMock = firestore.collection().add;
 *
 *      await blockSlotLogic(...);
 *
 *      // Expect the add function to have been called with the correct data
 *      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ note: 'Admin Block' }));
 *   });
 * });
 */
export const blockSlotLogic = _blockSlot;


/**
 * TESTABLE LOGIC (SERVER-SIDE)
 * This function contains the core logic for unblocking a slot and can be unit-tested.
 * It is called by the /api/availability/unblock route handler.
 */
export const unblockSlotLogic = _unblockSlot;


// --- CLIENT-SIDE FUNCTIONS ---

/**
 * Fetches both confirmed bookings and time-off blocks for a specific tutor on a given date.
 * This is a public-facing function and does not require authentication.
 * @param tutorId - The ID of the tutor.
 * @param date - The date for which to fetch availability.
 * @returns An object containing arrays of bookings and time-off blocks.
 */
export async function getAvailability(tutorId: string, date: Date): Promise<AvailabilityResponse> {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(`${API_BASE_URL}/availability/get?tutorId=${tutorId}&date=${formattedDate}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch availability data.');
  }
  return response.json();
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
