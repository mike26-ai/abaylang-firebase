import { NextResponse } from 'next/server';
import { adminDb, Timestamp } from '@/lib/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }

    const now = new Date();

    const sessionsSnapshot = await adminDb.collection('groupSessions')
      .where('status', '==', 'scheduled')
      .where('startTime', '>', now)
      .orderBy('startTime', 'asc')
      .get();

    if (sessionsSnapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const sessions = sessionsSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const parseTimestamp = (value: any) =>
        value instanceof Timestamp ? value.toDate().toISOString() : null;

      return {
        ...data,
        id: doc.id,
        startTime: parseTimestamp(data.startTime),
        endTime: parseTimestamp(data.endTime),
        createdAt: parseTimestamp(data.createdAt),
      };
    });

    return NextResponse.json({ success: true, data: sessions });

  } catch (error: any) {
    console.error('API Error (/api/group-sessions):', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group sessions.',
        details: error instanceof Error ? error.message : JSON.stringify(error),
        data: [],
      },
      { status: 500 }
    );
  }
}
