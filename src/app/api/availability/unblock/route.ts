// File: src/app/api/availability/unblock/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ADMIN_EMAIL } from '@/config/site';

// Initialize Firebase Admin SDK
const app = initAdmin();
const db = getFirestore(app);
const auth = getAuth(app);

// Zod schema for input validation
const UnblockTimeSchema = z.object({
  timeOffId: z.string().min(1, 'timeOffId is required.'),
});

/**
 * POST handler to unblock (delete) a time-off slot.
 * Requires admin authentication or that the user is the one who created the block.
 */
export async function POST(request: NextRequest) {
  // 1. Verify Authentication
  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ code: 'unauthenticated', message: 'No authentication token provided.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ code: 'unauthenticated', message: 'Invalid authentication token.' }, { status: 401 });
  }

  // 2. Validate Input Body
  const body = await request.json();
  const validationResult = UnblockTimeSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ code: 'invalid_input', message: validationResult.error.flatten().fieldErrors }, { status: 400 });
  }
  const { timeOffId } = validationResult.data;

  try {
    const timeOffDocRef = db.collection('timeOff').doc(timeOffId);
    const docSnap = await timeOffDocRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ code: 'not_found', message: 'Time off block not found.' }, { status: 404 });
    }

    const timeOffData = docSnap.data();
    
    // 3. Verify Authorization
    const isAdmin = decodedToken.email === ADMIN_EMAIL || decodedToken.admin === true;
    const isOwner = timeOffData?.blockedById === decodedToken.uid;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ code: 'unauthorized', message: 'User is not authorized to delete this time block.' }, { status: 403 });
    }

    // 4. Delete the document
    await timeOffDocRef.delete();

    // 5. Return success response
    return NextResponse.json({ message: 'Time off block successfully deleted.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error unblocking time slot:', error);
    return NextResponse.json({ code: 'server_error', message: 'Failed to unblock time slot.' }, { status: 500 });
  }
}
