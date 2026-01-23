// File: src/app/api/admin/students/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, Timestamp } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic'; // Ensures the route is not cached

/**
 * This API route securely fetches all user profiles from the Firestore 'users' collection.
 * It is protected by an admin check.
 */
export async function GET(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    // 1. Verify Authentication and Admin Status from the incoming request
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No authentication token provided.' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: User does not have admin privileges.' }, { status: 403 });
    }

    // 2. Perform database query using the Admin SDK
    const usersSnapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
    
    // 3. Serialize the data to be client-safe
    const students = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      // Safely convert Timestamps to ISO strings
      const createdAt = data.createdAt;
      const lastCreditPurchase = data.lastCreditPurchase;

      return {
        ...data,
        uid: doc.id,
        createdAt: createdAt && typeof (createdAt as any).toDate === 'function' ? (createdAt as any).toDate().toISOString() : null,
        lastCreditPurchase: lastCreditPurchase && typeof (lastCreditPurchase as any).toDate === 'function' ? (lastCreditPurchase as any).toDate().toISOString() : null,
        credits: data.credits?.map((credit: any) => ({
            ...credit,
            purchasedAt: credit.purchasedAt && typeof credit.purchasedAt.toDate === 'function' ? credit.purchasedAt.toDate().toISOString() : null,
        })) || [],
      };
    });

    // 4. Return the data
    return NextResponse.json({ success: true, data: students });

  } catch (error: any) {
    console.error('API /api/admin/students ERROR:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
