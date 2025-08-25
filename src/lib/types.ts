
import type { Timestamp } from "firebase/firestore";

export interface Booking {
  id: string;
  userId: string; // This must match security rules
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD format
  time: string;
  status: "awaiting-payment" | "confirmed" | "cancelled" | "completed";
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
  cancellationReason?: string; // For reschedule/cancellation data
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
  // New fields for one-time feedback system
  showFirstLessonFeedbackPrompt?: boolean; // Defaults to false
  hasSubmittedFirstLessonFeedback?: boolean; // Defaults to false
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

export interface LearningLesson {
  id: string;
  title: string;
  type: "video" | "interactive" | "quiz" | "reading";
  duration: number; // minutes
  status: "completed" | "in-progress" | "not-started" | "locked";
  // contentUrl?: string; // URL to video, quiz, etc.
}

export interface LearningModule {
  id:string; // Firestore document ID
  title: string;
  description: string;
  order: number; // For sequencing modules
  status: "completed" | "in-progress" | "locked"; // User-specific progress, might be handled differently
  progress: number; // User-specific progress (0-100), might be handled differently
  lessons: LearningLesson[];
  // totalLessons?: number; // Calculated or stored
  // completedLessons?: number; // User-specific, calculated or stored
}


export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  status: "pending" | "submitted" | "graded" | "late";
  feedback?: string;
  grade?: string;
  createdAt?: Timestamp;
}

export interface HomeworkSubmissionType {
  id?: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submissionText: string;
  submittedAt: Timestamp;
  status: "submitted" | "graded" | "late_submission";
  feedback?: string;
  grade?: string;
}

export interface LessonMaterial {
  id: string;
  title: string;
  description: string;
  fileUrl: string; // URL to the file in Firebase Storage
  fileName: string;
  fileType: string; // e.g., 'application/pdf', 'audio/mpeg'
  createdAt: Timestamp;
  uploaderId: string; // Admin's UID
  // Could add categories, levels, etc.
}
