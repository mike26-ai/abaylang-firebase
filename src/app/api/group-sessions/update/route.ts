// File: src/app/api/group-sessions/update/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';

const UpdateGroupSessionSchema = z.object({
  sessionId: z.string().min(1),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  zoomLink: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  minStudents: z.number().int().min(1),
  maxStudents: z.number().int().min(1),
}).refine(data => data.maxStudents >= data.minStudents, {
    message: "Maximum students must be greater than or equal to minimum students.",
    path: ["maxStudents"],
});


export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
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
    const validation = UpdateGroupSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { sessionId, ...updateData } = validation.data;
    const sessionRef = adminDb.collection('groupSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
    }

    const currentParticipantCount = sessionDoc.data()?.participantCount || 0;
    if (updateData.maxStudents < currentParticipantCount) {
        return NextResponse.json({ success: false, error: `Cannot set maximum students below the current number of participants (${currentParticipantCount}).` }, { status: 400 });
    }

    await sessionRef.update(updateData);

    return NextResponse.json({ success: true, message: 'Session successfully updated.' }, { status: 200 });

  } catch (error: any) {
    console.error('API Error (/group-sessions/update):', error);
    return NextResponse.json({ success: false, error: 'Failed to update group session.', details: error.message }, { status: 500 });
  }
}
