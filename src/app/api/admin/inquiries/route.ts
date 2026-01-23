// File: src/app/api/admin/inquiries/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb, Timestamp } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * This API route securely fetches all contact messages.
 * It is protected by an admin check.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = adminAuth();
    const db = adminDb();
    if (!auth || !db) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    // 1. Verify Authentication and Admin Status
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Perform database query using the Admin SDK
    const inquiriesSnapshot = await db.collection('contactMessages').orderBy('createdAt', 'desc').get();
    
    // 3. Serialize the data
    const inquiries = inquiriesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as any)?.toDate?.().toISOString(),
      };
    });

    // 4. Return the data
    return NextResponse.json({ success: true, data: inquiries });

  } catch (error: any) {
    console.error('API Error (/api/admin/inquiries):', error);
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication error.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch inquiries.' }, { status: 500 });
  }
}
