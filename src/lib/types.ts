
import type { Timestamp } from "firebase/firestore";

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD format
  time: string;
  status: "confirmed" | "cancelled" | "completed" | "pending";
  tutorId: string;
  tutorName: string;
  createdAt: Timestamp;
  // Optional fields
  lessonNotes?: string;
  duration?: number; // in minutes
}

export interface Testimonial {
  id: string;
  userId: string;
  name: string;
  userEmail?: string; // for admin reference
  rating: number; // 1-5
  comment: string;
  imageUrl?: string; // Optional
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

// User profile data stored in Firestore
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt: Timestamp;
  nativeLanguage?: string;
  // other fields as needed
}
