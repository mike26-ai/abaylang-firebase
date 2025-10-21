// File: src/app/api/group-sessions/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, initAdmin, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';
import { addMinutes, isBefore } from 'date-fns';

initAdmin();

const groupLessonTypes = [
    { value: 'quick-group-conversation', label: 'Quick Group Conversation', duration: 30, price: 7, description: 'A 30-minute session for practicing conversation with fellow learners.' },
    { value: 'immersive-conversation-practice', label: 'Immersive Conversation Practice', duration: 60, price: 12, description: 'A 60-minute session for deeper conversation and cultural insights.' }
];

const CreateGroupSessionSchema = z.object({
  sessionType: z.string().min(1, "Session type is required."),
  startTime: z.string().datetime("Invalid start time format."),
  maxStudents: z.number().int().min(2, "Maximum students must be at least 2."),
  tutorId: z.string().min(1),
  tutorName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const validation = CreateGroupSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { startTime, maxStudents, tutorId, tutorName, sessionType } = validation.data;

    const sessionTypeDetails = groupLessonTypes.find(t => t.value === sessionType);
    if (!sessionTypeDetails) {
        return NextResponse.json({ success: false, error: "Invalid session type provided." }, { status: 400 });
    }

    const startDateTime = new Date(startTime);
    if (isBefore(startDateTime, new Date())) {
      return NextResponse.json({ success: false, error: "Cannot schedule a session in the past." }, { status: 400 });
    }
    const endDateTime = addMinutes(startDateTime, sessionTypeDetails.duration);

    const newSessionId = await adminDb.runTransaction(async (transaction) => {
      const startTimestamp = Timestamp.fromDate(startDateTime);
      const endTimestamp = Timestamp.fromDate(endDateTime);

      // --- DEEP ANALYSIS FIX: Replace single complex query with multiple simple queries ---
      const bookingsRef = adminDb.collection('bookings');
      const statusesToCheck: ("confirmed" | "awaiting-payment" | "payment-pending-confirmation")[] = ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'];
      
      for (const status of statusesToCheck) {
        const bookingConflictQuery = bookingsRef
          .where('tutorId', '==', tutorId)
          .where('status', '==', status)
          .where('startTime', '<', endTimestamp)
          .where('endTime', '>', startTimestamp);
        
        const conflictingBookings = await transaction.get(bookingConflictQuery);
        if (!conflictingBookings.empty) {
          throw new Error('A private lesson is already booked in this time slot.');
        }
      }
      // --- END OF FIX ---

      // Check for conflicts with other group sessions
      const groupSessionsRef = adminDb.collection('groupSessions');
      const groupSessionConflictQuery = groupSessionsRef
          .where('tutorId', '==', tutorId)
          .where('status', '==', 'scheduled')
          .where('startTime', '<', endTimestamp)
          .where('endTime', '>', startTimestamp);
      const conflictingGroupSessions = await transaction.get(groupSessionConflictQuery);
       if (!conflictingGroupSessions.empty) {
          throw new Error('Another group session is already scheduled in this time slot.');
      }

      // Check for conflicts with time-off blocks
      const timeOffRef = adminDb.collection('timeOff');
      const timeOffConflictQuery = timeOffRef
          .where('tutorId', '==', tutorId)
          .where('startISO', '<', endDateTime.toISOString())
          .where('endISO', '>', startDateTime.toISOString());
      const conflictingTimeOff = await transaction.get(timeOffConflictQuery);
      if (!conflictingTimeOff.empty) {
          throw new Error('The tutor has blocked off this time as unavailable.');
      }
      
      const newSessionRef = adminDb.collection('groupSessions').doc();
      const newSessionData = {
        title: sessionTypeDetails.label,
        description: sessionTypeDetails.description,
        price: sessionTypeDetails.price,
        duration: sessionTypeDetails.duration,
        maxStudents,
        tutorId,
        tutorName,
        startTime: startTimestamp,
        endTime: endTimestamp,
        participantCount: 0,
        participantIds: [],
        status: "scheduled" as "scheduled" | "cancelled" | "completed",
        createdAt: Timestamp.now(),
      };

      transaction.set(newSessionRef, newSessionData);
      return newSessionRef.id;
    });

    return NextResponse.json({ success: true, sessionId: newSessionId }, { status: 201 });

  } catch (error: any) {
    console.error('API Error (/group-sessions/create):', error);
    if (error.message.includes('already booked') || error.message.includes('already scheduled') || error.message.includes('unavailable')) {
        return NextResponse.json({ success: false, error: `Scheduling conflict: ${error.message}` }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create group session.', details: error.message }, { status: 500 });
  }
}
