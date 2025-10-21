
// File: src/app/api/group-sessions/route.ts
import { NextResponse } from 'next/server';
import { adminDb, initAdmin, Timestamp } from '@/lib/firebase-admin';

initAdmin();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    // Fetch all scheduled sessions instead of using a complex query
    const sessionsSnapshot = await adminDb.collection('groupSessions')
      .where('status', '==', 'scheduled')
      .get();
      
    // Filter and sort in the code to avoid needing a composite index
    const sessions = sessionsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Convert Timestamps to a serializable format (ISO strings)
          startTime: (data.startTime as Timestamp).toDate().toISOString(),
          endTime: (data.endTime as Timestamp).toDate().toISOString(),
          createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        };
      })
      .filter(session => new Date(session.startTime) > now) // Filter for upcoming sessions
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); // Sort by start time

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('API Error (/api/group-sessions):', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch group sessions.' }, { status: 500 });
  }
}

    