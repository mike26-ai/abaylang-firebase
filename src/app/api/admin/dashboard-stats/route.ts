// File: src/app/api/admin/dashboard-stats/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { startOfDay, format } from 'date-fns';
import { ADMIN_EMAIL } from '@/config/site';

// Ensure Firebase Admin is initialized
initAdmin();

/**
 * This API route securely fetches all necessary data for the admin dashboard.
 * It uses the Firebase Admin SDK, bypassing all client-side security rules,
 * and is protected by an admin check.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authentication and Admin Status
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    const isAdmin = decodedToken.email === ADMIN_EMAIL || decodedToken.admin === true;
    if (!isAdmin) {
      return NextResponse.json({ error: 'User does not have admin privileges.' }, { status: 403 });
    }

    // 2. Perform all database queries concurrently for performance
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

    const serialize = (docs: admin.firestore.QuerySnapshot) => 
      docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const data = {
        stats,
        recentBookings: serialize(recentBookingsSnapshot),
        pendingTestimonials: serialize(latestPendingTestimonialsSnapshot),
        recentMessages: serialize(recentMessagesSnapshot),
        recentStudents: serialize(recentStudentsSnapshot),
    };

    // 4. Return the combined data
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Error (/api/admin/dashboard-stats):', error);
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token has expired. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics.', details: error.message }, { status: 500 });
  }
}
