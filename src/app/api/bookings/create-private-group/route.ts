
// File: src/app/api/bookings/create-private-group/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { addMinutes, parse } from 'date-fns';
import { createBooking } from '@/services/bookingService';

const PrivateGroupMemberSchema = z.object({
  uid: z.string().optional(), // Make UID optional for incoming non-leader members
  name: z.string().min(1, "Member name is required."),
  email: z.string().email("Invalid email format for a member."),
});

const CreatePrivateGroupSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().positive(),
  lessonType: z.string(),
  pricePerStudent: z.number().min(0),
  tutorId: z.string(),
  leader: PrivateGroupMemberSchema.extend({ uid: z.string().min(1) }), // Leader must have UID
  members: z.array(PrivateGroupMemberSchema).min(1, "At least one other member is required.").max(5, "A maximum of 5 other members can be invited."),
});

type PrivateGroupPayload = z.infer<typeof CreatePrivateGroupSchema>;

async function _createPrivateGroupBooking(payload: PrivateGroupPayload, decodedToken: DecodedIdToken) {
    const leaderUid = payload.leader.uid;
    if (decodedToken.uid !== leaderUid) { 
        throw new Error("unauthorized");
    }

    const startDateTime = parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const startTime = Timestamp.fromDate(startDateTime);
    const endTime = Timestamp.fromDate(addMinutes(startDateTime, payload.duration));
    const allParticipants = [payload.leader, ...payload.members];

    return await adminDb.runTransaction(async (transaction) => {
        // 1. Check for booking conflicts for the tutor
        const bookingsRef = adminDb.collection('bookings');
        const bookingConflictQuery = bookingsRef
            .where('tutorId', '==', payload.tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', endTime)
            .where('endTime', '>', startTime);
        const conflictingBookings = await transaction.get(bookingConflictQuery);
        if (!conflictingBookings.empty) {
            throw new Error('slot_already_booked');
        }
        
        // 2. Create the private GroupSession document
        const newGroupSessionRef = adminDb.collection('groupSessions').doc();
        transaction.set(newGroupSessionRef, {
            title: `Private Group - ${payload.leader.name}`,
            description: `A private lesson for a group of ${allParticipants.length} organized by ${payload.leader.name}.`,
            startTime: startTime,
            endTime: endTime,
            duration: payload.duration,
            price: payload.pricePerStudent,
            tutorId: payload.tutorId,
            tutorName: "Mahder N. Mamo",
            maxStudents: allParticipants.length,
            participantCount: 0, // Will be updated as bookings are confirmed
            participantIds: [],
            status: "scheduled",
            type: "private", // Special flag
            createdAt: Timestamp.now(),
        });

        // 3. Create a placeholder booking for each participant
        let leaderBookingId = '';
        for (const participant of allParticipants) {
            const newBookingRef = adminDb.collection('bookings').doc();
            const isLeader = participant.uid === leaderUid;
            
            if (isLeader) {
                leaderBookingId = newBookingRef.id;
            }

            transaction.set(newBookingRef, {
                userId: participant.uid || null, // Guest members may not have a UID yet
                userName: participant.name,
                userEmail: participant.email,
                date: payload.date,
                time: payload.time,
                startTime: startTime,
                endTime: endTime,
                duration: payload.duration,
                lessonType: payload.lessonType,
                price: payload.pricePerStudent,
                status: 'payment-pending-confirmation', // FIX: Corrected status
                tutorId: payload.tutorId,
                tutorName: "Mahder N. Mamo",
                groupSessionId: newGroupSessionRef.id,
                isFreeTrial: false,
                createdAt: Timestamp.now(),
            });
        }
        
        if (!leaderBookingId) {
            throw new Error("Failed to designate a booking for the group leader.");
        }

        return { bookingId: leaderBookingId, groupSessionId: newGroupSessionRef.id };
    });
}


export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const body = await request.json();
    
    const validation = CreatePrivateGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const result = await _createPrivateGroupBooking(validation.data, decodedToken);
    
    // The createBooking service function will now generate the checkout URL
    const { redirectUrl } = await createBooking({
        productId: validation.data.duration === 30 ? 'private-quick-group' : 'private-immersive-group',
        userId: decodedToken.uid,
        date: validation.data.date,
        time: validation.data.time,
    });

    return NextResponse.json({ success: true, ...result, redirectUrl }, { status: 201 });

  } catch (error: any) {
    console.error('API Error (create-private-group):', error);
    if (error.message === 'slot_already_booked') {
        return NextResponse.json({ success: false, message: 'This time slot is no longer available. Please select another time.' }, { status: 409 });
    }
     if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Your user ID does not match the group leader.' }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
