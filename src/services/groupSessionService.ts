
// File: src/services/groupSessionService.ts
import { auth } from "@/lib/firebase";
import type { GroupSession } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

const API_BASE_URL = '/api';

interface CreateGroupSessionPayload {
  sessionType: string;
  startTime: Date;
  minStudents: number;
  maxStudents: number;
  tutorId: string;
  tutorName: string;
}

/**
 * Creates a new group session. Admin only.
 */
export async function createGroupSession(payload: CreateGroupSessionPayload): Promise<{ sessionId: string }> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required.");
  }
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/group-sessions/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      ...payload,
      startTime: payload.startTime.toISOString(), // Send as ISO string
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to create group session.');
  }
  return result;
}

/**
 * Fetches all upcoming, scheduled group sessions.
 */
export async function getGroupSessions(): Promise<GroupSession[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/group-sessions`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch group sessions.');
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Server responded with an error.');
        }
        // Convert ISO strings back to Firestore Timestamps for client-side type consistency
        return result.data.map((session: any) => ({
            ...session,
            startTime: Timestamp.fromDate(new Date(session.startTime)),
            endTime: Timestamp.fromDate(new Date(session.endTime)),
            createdAt: Timestamp.fromDate(new Date(session.createdAt)),
        }));
    } catch (error: any) {
        console.error("Error in getGroupSessions service:", error);
        throw error;
    }
}

/**
 * Cancels a group session. Admin only.
 */
export async function cancelGroupSession(sessionId: string): Promise<{ message: string }> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required.");
  }
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/group-sessions/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to cancel group session.');
  }
  return result;
}

interface UpdateGroupSessionPayload {
    sessionId: string;
    title: string;
    description: string;
    zoomLink?: string;
    minStudents: number;
    maxStudents: number;
}

/**
 * Updates the details of an existing group session. Admin only.
 */
export async function updateGroupSession(payload: UpdateGroupSessionPayload): Promise<{ success: boolean; message: string }> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Authentication required.");
    }
    const idToken = await user.getIdToken();

    const response = await fetch(`${API_BASE_URL}/group-sessions/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update group session.');
    }
    return result;
}
