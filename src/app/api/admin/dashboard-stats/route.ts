// File: src/app/api/admin/dashboard-stats/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { startOfDay, format } from 'date-fns';
import { ADMIN_EMAIL } from '@/config/site';

// Initialize Firebase Admin SDK
initAdmin();
const adminAuth = getAuth();
const adminDb = getFirestore();

/**
 * This API route securely fetches all necessary data for the admin dashboard.
 * It is protected by an admin check that verifies the user's ID token and Firestore role.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authentication and Admin Status from the incoming request
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No authentication token provided.' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    const isAdmin = userData?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: User does not have admin privileges.' }, { status: 403 });
    }

    // 2. Perform all database queries concurrently using the Admin SDK
    const today = startOfDay(new Date());

    const [
        upcomingBookingsSnapshot,
        pendingTestimonialsSnapshot,
        newInquiriesSnapshot,
        totalStudentsSnapshot,
        newBookingsSnapshot,
        recentBookingsSnapshot,
        recentMessagesSnapshot,
        recentStudentsSnapshot,
        latestPendingTestimonialsSnapshot,
        approvedTestimonialsSnapshot
    ] = await Promise.all([
        adminDb.collection('bookings').where('date', '>=', format(today, 'yyyy-MM-dd')).where('status', '==', 'confirmed').get(),
        adminDb.collection('testimonials').where('status', '==', 'pending').count().get(),
        adminDb.collection('contactMessages').where('read', '==', false).count().get(),
        adminDb.collection('users').where('role', '==', 'student').count().get(),
        adminDb.collection('bookings').where('status', '==', 'payment-pending-confirmation').count().get(),
        adminDb.collection('bookings').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('contactMessages').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('users').where('role', '==', 'student').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('testimonials').where('status', '==', 'pending').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('testimonials').where('status', '==', 'approved').get(),
    ]);

    // 3. Process the results
    const approvedRatings = approvedTestimonialsSnapshot.docs.map(doc => doc.data().rating);
    const averageRating = approvedRatings.length > 0 
        ? approvedRatings.reduce((sum, rating) => sum + rating, 0) / approvedRatings.length 
        : 0;

    const stats = {
      upcomingBookings: upcomingBookingsSnapshot.size,
      pendingTestimonialsCount: pendingTestimonialsSnapshot.data().count,
      newInquiries: newInquiriesSnapshot.data().count,
      totalStudents: totalStudentsSnapshot.data().count,
      newBookingsCount: newBookingsSnapshot.data().count,
      totalRevenue: 1250, // Placeholder
      averageRating: averageRating,
    };

    const serializeTimestamp = (docs: admin.firestore.QueryDocumentSnapshot[]) => 
      docs.map(doc => {
          const data = doc.data();
          const serializedData: { [key: string]: any } = { id: doc.id };
          for (const key in data) {
              if (data[key] instanceof admin.firestore.Timestamp) {
                  serializedData[key] = data[key].toDate().toISOString();
              } else {
                  serializedData[key] = data[key];
              }
          }
          return serializedData;
      });

    const data = {
        stats,
        recentBookings: serializeTimestamp(recentBookingsSnapshot.docs),
        pendingTestimonials: serializeTimestamp(latestPendingTestimonialsSnapshot.docs),
        recentMessages: serializeTimestamp(recentMessagesSnapshot.docs),
        recentStudents: serializeTimestamp(recentStudentsSnapshot.docs),
    };

    // 4. Return the combined data
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Error (/api/admin/dashboard-stats):', error);
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token has expired. Please log in again.' }, { status: 401 });
    }
     if (error.code === 'auth/argument-error') {
        return NextResponse.json({ error: 'Invalid authentication token provided.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics.', details: error.message }, { status: 500 });
  }
}
