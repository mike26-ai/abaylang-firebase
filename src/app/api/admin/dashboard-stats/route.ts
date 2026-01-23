// File: src/app/api/admin/dashboard-stats/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb, Timestamp } from '@/lib/firebase-admin';
import { startOfDay } from 'date-fns';
import type { Booking, Testimonial } from '@/lib/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

/**
 * This API route securely fetches all necessary data for the admin dashboard.
 * It is protected by an admin check and uses resilient queries that do not require composite indexes.
 */
export async function GET(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
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
        allBookingsSnapshot,
        allTestimonialsSnapshot,
        newInquiriesSnapshot,
        totalStudentsSnapshot,
        recentBookingsSnapshot,
        recentMessagesSnapshot,
        recentStudentsSnapshot,
    ] = await Promise.all([
        adminDb.collection('bookings').get(),
        adminDb.collection('testimonials').get(),
        adminDb.collection('contactMessages').where('read', '==', false).count().get(),
        adminDb.collection('users').where('role', '==', 'student').count().get(),
        adminDb.collection('bookings').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('contactMessages').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('users').where('role', '==', 'student').orderBy('createdAt', 'desc').limit(5).get(),
    ]);

    // 3. Process the results in-memory to avoid complex index requirements
    const allBookings = allBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    const allTestimonials = allTestimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));

    const upcomingBookingsCount = allBookings.filter(doc => {
        const bookingDate = doc.date;
        if (!bookingDate || typeof bookingDate !== 'string') return false;
        const date = new Date(bookingDate);
        return doc.status === 'confirmed' && (isNaN(date.getTime()) ? false : date >= today);
    }).length;

    const newBookingsCount = allBookings.filter(doc => 
        ['awaiting-payment', 'payment-pending-confirmation'].includes(doc.status)
    ).length;

    const pendingResolutions = allBookings
        .filter(doc => doc.status === 'cancellation-requested')
        .sort((a, b) => (b.createdAt as any).toMillis() - (a.createdAt as any).toMillis());

    const pendingTestimonials = allTestimonials
        .filter(t => t.status === 'pending')
        .sort((a, b) => (b.createdAt as any).toMillis() - (a.createdAt as any).toMillis());

    const approvedRatings = allTestimonials
        .filter(t => t.status === 'approved')
        .map(t => t.rating);

    const averageRating = approvedRatings.length > 0 
        ? approvedRatings.reduce((sum, rating) => sum + rating, 0) / approvedRatings.length 
        : 0;

    const stats = {
      upcomingBookings: upcomingBookingsCount,
      pendingTestimonialsCount: pendingTestimonials.length,
      newInquiries: newInquiriesSnapshot.data().count,
      totalStudents: totalStudentsSnapshot.data().count,
      newBookingsCount: newBookingsCount,
      pendingResolutionsCount: pendingResolutions.length,
      totalRevenue: 1250, // Placeholder
      averageRating: averageRating,
    };

    const serializeTimestamp = (docs: DocumentData[]) => 
      docs.map(doc => {
          const data = doc;
          const serializedData: { [key: string]: any } = { id: doc.id };
          for (const key in data) {
              if (data[key] instanceof Timestamp) {
                  serializedData[key] = data[key].toDate().toISOString();
              } else if (key !== 'id') {
                  serializedData[key] = data[key];
              }
          }
          return serializedData;
      });
      
    const serializeSnapshot = (docs: QueryDocumentSnapshot[]) => 
        docs.map(doc => {
            const data = doc.data();
            const serializedData: { [key: string]: any } = { id: doc.id };
            for (const key in data) {
                if (data[key] instanceof Timestamp) {
                    serializedData[key] = data[key].toDate().toISOString();
                } else {
                    serializedData[key] = data[key];
                }
            }
            return serializedData;
        });

    const data = {
        stats,
        recentBookings: serializeSnapshot(recentBookingsSnapshot.docs),
        pendingTestimonials: serializeTimestamp(pendingTestimonials.slice(0, 5)),
        recentMessages: serializeSnapshot(recentMessagesSnapshot.docs),
        recentStudents: serializeSnapshot(recentStudentsSnapshot.docs),
        pendingResolutions: serializeTimestamp(pendingResolutions),
    };

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
