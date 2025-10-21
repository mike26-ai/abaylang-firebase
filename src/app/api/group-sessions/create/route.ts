
// File: src/app/api/group-sessions/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, initAdmin, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';
import { addMinutes } from 'date-fns';

initAdmin();

const CreateGroupSessionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  startTime: z.string().datetime("Invalid start time format."),
  duration: z.number().int().positive("Duration must be a positive number."),
  price: z.number().min(0, "Price cannot be negative."),
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
    const { startTime, duration, ...restOfData } = validation.data;
    
    const startTimestamp = Timestamp.fromDate(new Date(startTime));
    const endTimestamp = Timestamp.fromDate(addMinutes(new Date(startTime), duration));

    const newSessionData = {
      ...restOfData,
      startTime: startTimestamp,
      endTime: endTimestamp,
      duration,
      participantCount: 0,
      participantIds: [],
      status: "scheduled" as "scheduled" | "cancelled" | "completed",
      createdAt: Timestamp.now(),
    };

    const newSessionRef = await adminDb.collection('groupSessions').add(newSessionData);

    return NextResponse.json({ success: true, sessionId: newSessionRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('API Error (/group-sessions/create):', error);
    return NextResponse.json({ success: false, error: 'Failed to create group session.', details: error.message }, { status: 500 });
  }
}
