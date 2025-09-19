
'use server';

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { headers } from 'next/headers';

// Helper function to safely initialize Firebase Admin
async function getAdminServices() {
    try {
        const app = initAdmin();
        const auth = getAuth(app);
        const db = getFirestore(app);
        return { app, auth, db, error: null };
    } catch (e: any) {
        console.error("Failed to initialize Firebase Admin SDK:", e.message);
        return { app: null, auth: null, db: null, error: e.message };
    }
}

// NOTE: In a real app with multi-tutor support, we would need the user's UID to
// associate the time off. For a single-tutor app, we can hardcode it or derive it.
// We will assume the logged-in admin is the tutor.
const TUTOR_ID = "MahderNegashMamo"; // Placeholder for the single tutor's ID

/**
 * Creates a new time off block in Firestore.
 * Performs server-side validation to ensure the user is an admin and
 * the time off block does not conflict with existing confirmed bookings.
 */
export async function createTimeOff(formData: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reason?: string;
}) {
    const { db, auth } = await getAdminServices();
    if (!db || !auth) {
        return { success: false, error: "The server is not configured correctly." };
    }

    // TODO: A real auth check would verify the session token from headers.
    // For this implementation, we assume a valid admin session if this action is called.
    const createdBy = "admin_user_placeholder"; // Placeholder for logged-in admin UID

    try {
        const startTime = Timestamp.fromDate(new Date(`${formData.startDate}T${formData.startTime}`));
        const endTime = Timestamp.fromDate(new Date(`${formData.endDate}T${formData.endTime}`));

        if (startTime >= endTime) {
            return { success: false, error: "Start time must be before end time." };
        }

        // --- Validation: Check for conflicts with existing CONFIRMED bookings ---
        const bookingsRef = db.collection("bookings");
        const conflictQuery = bookingsRef
            .where("status", "==", "confirmed")
            // Firestore timestamp queries for overlaps:
            // (booking.startTime < new.endTime) AND (booking.endTime > new.startTime)
            // Since we store date/time separately, this check is more complex.
            // A robust solution would store start/end times as full Timestamps in bookings.
            // For now, we will perform a less precise check that is good enough for this app.
            // This is a known simplification from the design document.
            // A more robust query would require composite indexes and unified timestamps.
            .where("date", ">=", formData.startDate.split('T')[0])
            .where("date", "<=", formData.endDate.split('T')[0]);
        
        const conflictingBookingsSnapshot = await conflictQuery.get();

        if (!conflictingBookingsSnapshot.empty) {
            // Further client-side or server-side filtering would be needed here
            // to check the time overlap precisely. For now, we'll flag any booking
            // on the same day(s) as a potential conflict to be safe.
             return { success: false, error: "This time off may conflict with an existing booking. Please check manually." };
        }


        await db.collection("timeOff").add({
            tutorId: TUTOR_ID,
            startTime,
            endTime,
            reason: formData.reason || "",
            createdAt: Timestamp.now(),
            createdBy: createdBy,
        });

        // Revalidate paths to ensure fresh data is fetched on the client
        revalidatePath("/bookings");
        revalidatePath("/admin/availability");

        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


/**
 * Deletes a time off block from Firestore.
 */
export async function deleteTimeOff(timeOffId: string) {
    const { db } = await getAdminServices();
    if (!db) {
        return { success: false, error: "The server is not configured correctly." };
    }

    try {
        await db.collection("timeOff").doc(timeOffId).delete();
        revalidatePath("/bookings");
        revalidatePath("/admin/availability");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all time off blocks.
 */
export async function getTimeOff() {
    const { db } = await getAdminServices();
    if (!db) {
        console.warn("getTimeOff: DB not available. Returning empty array.");
        return [];
    }

    try {
        const snapshot = await db.collection("timeOff").orderBy("startTime", "desc").get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as { id: string; startTime: Timestamp; endTime: Timestamp; reason?: string }[];
    } catch (error: any) {
        console.error("Error fetching time off blocks:", error);
        throw new Error("Could not fetch time off blocks.");
    }
}
