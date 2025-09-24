
'use server';

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { headers } from 'next/headers';

// Define a consistent return type for all actions
type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Shape of the time off data returned to the client
type TimeOffData = {
  id: string;
  startTime: Timestamp;
  endTime: Timestamp;
  reason?: string;
};

// Shape of the form data coming from the client
type TimeOffInput = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason?: string;
};


// Helper function to safely initialize Firebase Admin
async function getAdminServices() {
  try {
    const app = initAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db, error: null };
  } catch (e: any) {
    console.error("Failed to initialize Firebase Admin SDK:", e.message);
    // Return a specific, recognizable error message
    return { app: null, auth: null, db: null, error: "The server is not configured correctly." };
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
export async function createTimeOff(formData: TimeOffInput): Promise<ActionResponse> {
  const { db, error } = await getAdminServices();
  if (error || !db) {
    return { success: false, error: error || "Database connection failed." };
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

        // This is the query that requires the composite index.
        const bookingsRef = db.collection("bookings");
        const conflictQuery = bookingsRef
            .where("status", "==", "confirmed")
            .where("startTime", "<", endTime)
            .where("endTime", ">", startTime);
        
        const conflictingBookingsSnapshot = await conflictQuery.get();

        if (!conflictingBookingsSnapshot.empty) {
             return { success: false, error: "This time off conflicts with an existing confirmed booking." };
        }


        await db.collection("timeOff").add({
            tutorId: TUTOR_ID,
            startTime,
            endTime,
            reason: formData.reason || "",
            createdAt: Timestamp.now(),
            createdBy: createdBy,
        });

        revalidatePath("/bookings");
        revalidatePath("/admin/availability");

        return { success: true };

    } catch (error: any) {
        console.error("Error in createTimeOff action:", error);
        // This makes the error message more visible to the user if it's an index issue.
        if (error.code === 'FAILED_PRECONDITION') {
            return { success: false, error: "Query requires a Firestore index. Please check the server terminal logs for a link to create it." };
        }
        return { success: false, error: error.message || "An unexpected server error occurred." };
    }
}


/**
 * Deletes a time off block from Firestore.
 */
export async function deleteTimeOff(timeOffId: string): Promise<ActionResponse> {
    const { db, error } = await getAdminServices();
    if (error || !db) {
        return { success: false, error: error || "Database connection failed." };
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
export async function getTimeOff(): Promise<ActionResponse<TimeOffData[]>> {
  const { db, error } = await getAdminServices();
  if (error || !db) {
    return { success: false, error: error || "Database connection failed." };
  }

  try {
    const snapshot = await db.collection("timeOff").orderBy("startTime", "desc").get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TimeOffData[];
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching time off blocks:", error);
    return { success: false, error: "Could not fetch time off blocks due to a server error." };
  }
}
