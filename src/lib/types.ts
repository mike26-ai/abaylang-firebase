
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
  lessonType?: string; // Added from booking form
  price?: number; // Added from booking form
  learningGoals?: string; // Added from booking form
}

export interface Testimonial {
  id: string;
  userId: string;
  name: string;
  userEmail?: string; // for admin reference
  rating: number; // 1-5
  comment: string;
  imageUrl?: string; // Optional
  location?: string; 
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  // Fields from new Review design
  studentInitials?: string;
  lessonType?: string;
  specificRatings?: {
    teachingQuality?: number;
    materialClarity?: number;
    culturalInsights?: number;
    pacing?: number;
    engagement?: number;
  };
  helpful?: number;
  // For display purposes, not stored in DB directly if fetched and formatted
  date?: string; 
  verified?: boolean; 
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
  country?: string;
  amharicLevel?: string;
  // other fields as needed
}

export interface ChatMessage {
  id: string; // Firestore document ID
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string | null; // Optional: user.photoURL
  timestamp: Timestamp; // Firestore Timestamp
}
