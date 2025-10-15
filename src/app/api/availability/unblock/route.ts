// File: src/app/api/availability/unblock/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { ADMIN_EMAIL } from '@/config/site';

// Initialize Firebase Admin SDK
try {
  initAdmin();
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK in unblock/route.ts", error);
}
const auth = getAuth();

// Zod schema for input validation
const UnblockTimeSchema = z.object({
  timeOffId: z.string().min(1, 'timeOffId is required.'),
});

/**
 * POST handler to unblock (delete) a time-off slot.
 * Uses a Firestore transaction to ensure the operation is atomic.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);

    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = UnblockTimeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    const { timeOffId } = validationResult.data;

    // 3. Perform Firestore transaction
    const result = await adminDb.runTransaction(async (transaction) => {
        const timeOffDocRef = adminDb.collection('timeOff').doc(timeOffId);
        const docSnap = await transaction.get(timeOffDocRef);

        if (!docSnap.exists) {
            const error = new Error('not_found');
            throw error;
        }

        const timeOffData = docSnap.data();
        const isAdmin = decodedToken.admin === true || decodedToken.email === ADMIN_EMAIL;
        const isOwner = timeOffData?.blockedById === decodedToken.uid;

        // Authorization check: Must be admin or the user who created the block
        if (!isAdmin && !isOwner) {
            const error = new Error('unauthorized');
            throw error;
        }
        
        transaction.delete(timeOffDocRef);
        return { message: 'Time off block successfully deleted.' };
    });

    // 4. Return success response
    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error: any) {
    console.error('API Error (/availability/unblock):', error);
    if (error.message === 'not_found') {
        return NextResponse.json({ success: false, error: 'Time off block not found.', details: error.message }, { status: 404 });
    }
    if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, error: 'User is not authorized to delete this time block.', details: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to unblock time slot.', details: error?.message },
      { status: 500 }
    );
  }
}
