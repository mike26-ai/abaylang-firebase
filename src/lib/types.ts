
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
  lessonType?: string;
  price?: number;
  learningGoals?: string;
  hasReview?: boolean; // Added for student dashboard
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
  date?: string;
  verified?: boolean;
  lessonId?: string; // Added for linking testimonial to a lesson
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
  photoURL?: string | null;
}

export interface ChatMessage {
  id: string; // Firestore document ID
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string | null; // Optional: user.photoURL
  timestamp: Timestamp; // Firestore Timestamp
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribedAt: Timestamp;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp; // Store as Timestamp in Firestore
  status: "pending" | "submitted" | "graded" | "late";
  feedback?: string;
  grade?: string;
  createdAt?: Timestamp; // For ordering if needed
}

export interface HomeworkSubmissionType {
  id?: string; // Firestore ID, generated automatically
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string; // Good to have for admin view
  submissionText: string;
  // files: { name: string, url: string }[]; // Future: store file metadata
  submittedAt: Timestamp;
  status: "submitted" | "graded" | "late_submission"; // Status of the submission itself
  feedback?: string; // Tutor's feedback on this submission
  grade?: string; // Grade for this submission
}
