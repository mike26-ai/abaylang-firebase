'use server';

import { initAdmin } from '@/lib/firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { format, startOfDay, endOfDay } from 'date-fns';

// Define the shape of the data returned by this action
export interface SlotData {
  booked: { startTime: Date; endTime: Date }[];
  timeOff: { startTime: Date; endTime: Date }[];
  // Placeholders for future features like blocked/priority slots
}

type SlotDataResult = {
  success: boolean;
  data?: SlotData;
  error?: string;
};


/**
 * Fetches all necessary data to determine slot availability for a given date.
 * This includes confirmed bookings and tutor time off blocks.
 */
export async function getSlotData(date: Date): Promise<SlotDataResult> {
  if (!date) {
    return { success: false, error: 'A valid date must be provided.' };
  }

  try {
    const app = initAdmin();
    const db = getFirestore(app);
    
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // --- Fetch Data in Parallel ---

    // 1. Fetch Confirmed Bookings for the day
    const bookingsPromise = db.collection('bookings')
      .where('status', 'in', ['confirmed', 'completed', 'awaiting-payment'])
      .where('date', '==', format(date, 'yyyy-MM-dd'))
      .get();
      
    // 2. Fetch Time Off blocks that overlap with the day
    const timeOffPromise = db.collection('timeOff')
      .where('startTime', '<=', Timestamp.fromDate(dayEnd))
      .where('endTime', '>=', Timestamp.fromDate(dayStart))
      .get();
      
    const [bookingsSnapshot, timeOffSnapshot] = await Promise.all([bookingsPromise, timeOffPromise]);

    // --- Process Results ---

    const bookedRanges = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        const startTime = new Date(`${data.date}T${data.time}`);
        const endTime = new Date(startTime.getTime() + (data.duration || 60) * 60 * 1000);
        return { startTime, endTime };
    });

    const timeOffRanges = timeOffSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            startTime: (data.startTime as Timestamp).toDate(),
            endTime: (data.endTime as Timestamp).toDate(),
        };
    });

    return {
      success: true,
      data: {
        booked: bookedRanges,
        timeOff: timeOffRanges,
      },
    };

  } catch (error: any) {
    console.error('Error fetching slot data:', error);
    // Hide implementation details from the client
    return { success: false, error: 'Could not fetch availability. Please try again later.' };
  }
}
