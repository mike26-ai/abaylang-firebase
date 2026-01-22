
<<<<<<< HEAD
import type { Timestamp } from "firebase/firestore";
=======

import type { Timestamp } from "firebase/firestore";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
>>>>>>> before-product-selection-rewrite

export interface Booking {
  id: string;
  userId: string; // This must match security rules
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD format
  time: string;
<<<<<<< HEAD
  status: "awaiting-payment" | "confirmed" | "cancelled" | "completed";
  tutorId: string;
  tutorName: string;
  createdAt: Timestamp;
=======
  status: "awaiting-payment" | "payment-pending-confirmation" | "confirmed" | "cancelled" | "completed" | "cancellation-requested" | "refunded" | "credit-issued" | "cancelled-by-admin" | "rescheduled" | "in-progress" | "no-show";
  tutorId: string;
  tutorName: string;
  createdAt: Timestamp | AdminTimestamp;
  updatedAt?: Timestamp | AdminTimestamp; // For tracking updates like rescheduling
  startTime?: Timestamp | AdminTimestamp | null;
  endTime?: Timestamp | AdminTimestamp | null;
>>>>>>> before-product-selection-rewrite
  // Optional fields
  lessonNotes?: string;
  duration?: number; // in minutes
  lessonType?: string;
  price?: number;
  learningGoals?: string;
  hasReview?: boolean; // Added for student dashboard
  cancellationReason?: string; // For reschedule/cancellation data
  paymentNote?: string; // Note from student (e.g., transaction ID)
<<<<<<< HEAD
  zoomLink?: string; // NEW: For the lesson's Zoom link
}

=======
  zoomLink?: string;
  groupSessionId?: string;
  wasRedeemedWithCredit?: boolean;
  creditTypeUsed?: string;
  requestedResolution?: 'refund' | 'credit'; // For cancellation flow
  productId?: string;
  productType?: 'individual' | 'group' | 'private-group' | 'package';
  paddleTransactionId?: string;
  parentPackageId?: string; // Links a redeemed lesson to its parent package booking
  statusHistory?: {
      status: string;
      changedAt: Timestamp | AdminTimestamp;
      changedBy: string; // 'student', 'admin', 'system'
      reason?: string;
  }[];
}

export interface TimeOff {
  id: string;
  tutorId: string;
  startISO: string; // ISO 8601 format string
  endISO: string;   // ISO 8601 format string
  blockedById: string;
  blockedByEmail?: string;
  note?: string;
  createdAt: Timestamp | AdminTimestamp;
}

export interface GroupSession {
  id: string;
  title: string;
  description: string;
  startTime: Timestamp | AdminTimestamp;
  endTime: Timestamp | AdminTimestamp;
  duration: number; // in minutes
  price: number;
  tutorId: string;
  tutorName: string;
  minStudents: number;
  maxStudents: number;
  participantCount: number;
  participantIds: string[];
  status: "scheduled" | "cancelled" | "completed";
  createdAt: Timestamp | AdminTimestamp;
  zoomLink?: string;
}


>>>>>>> before-product-selection-rewrite
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
<<<<<<< HEAD
  createdAt: Timestamp;
=======
  createdAt: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
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
<<<<<<< HEAD
  lessonId?: string; // Added for linking testimonial to a lesson
=======
  lessonId?: string;
>>>>>>> before-product-selection-rewrite
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
<<<<<<< HEAD
  createdAt: Timestamp;
=======
  createdAt: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
  read: boolean;
}

// User profile data stored in Firestore
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "student" | "admin";
<<<<<<< HEAD
  createdAt: Timestamp;
=======
  createdAt: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
  nativeLanguage?: string;
  country?: string;
  amharicLevel?: string;
  photoURL?: string | null;
<<<<<<< HEAD
  // New fields for one-time feedback system
  showFirstLessonFeedbackPrompt?: boolean; // Defaults to false
  hasSubmittedFirstLessonFeedback?: boolean; // Defaults to false
=======
  showFirstLessonFeedbackPrompt?: boolean;
  hasSubmittedFirstLessonFeedback?: boolean;
  credits?: UserCredit[];
  lastCreditPurchase?: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
}

export interface ChatMessage {
  id: string; // Firestore document ID
  text: string;
  userId: string;
  userName: string;
<<<<<<< HEAD
  userAvatar?: string | null; // Optional: user.photoURL
  timestamp: Timestamp; // Firestore Timestamp
=======
  userAvatar?: string | null;
  timestamp: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
}

export interface NewsletterSubscription {
  id: string;
  email: string;
<<<<<<< HEAD
  subscribedAt: Timestamp;
=======
  subscribedAt: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
}

export interface LearningLesson {
  id: string;
  title: string;
  type: "video" | "interactive" | "quiz" | "reading";
  duration: number; // minutes
  status: "completed" | "in-progress" | "not-started" | "locked";
<<<<<<< HEAD
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
=======
}

export interface LearningModule {
  id:string;
  title: string;
  description: string;
  order: number;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  lessons: LearningLesson[];
>>>>>>> before-product-selection-rewrite
}


export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
<<<<<<< HEAD
  dueDate: Timestamp;
  status: "pending" | "submitted" | "graded" | "late";
  feedback?: string;
  grade?: string;
  createdAt?: Timestamp;
=======
  dueDate: Timestamp | AdminTimestamp;
  status: "pending" | "submitted" | "graded" | "late";
  feedback?: string;
  grade?: string;
  createdAt?: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
}

export interface HomeworkSubmissionType {
  id?: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submissionText: string;
<<<<<<< HEAD
  submittedAt: Timestamp;
=======
  submittedAt: Timestamp | AdminTimestamp;
>>>>>>> before-product-selection-rewrite
  status: "submitted" | "graded" | "late_submission";
  feedback?: string;
  grade?: string;
}

export interface LessonMaterial {
  id: string;
  title: string;
  description: string;
<<<<<<< HEAD
  fileUrl: string; // URL to the file in Firebase Storage
  fileName: string;
  fileType: string; // e.g., 'application/pdf', 'audio/mpeg'
  createdAt: Timestamp;
  uploaderId: string; // Admin's UID
  // Could add categories, levels, etc.
=======
  fileUrl: string;
  fileName: string;
  fileType: string;
  createdAt: Timestamp | AdminTimestamp;
  uploaderId: string;
}

// Represents a user's credit balance for packages
export interface UserCredit {
  lessonType: string; // Corresponds to product 'id', e.g., 'learning-intensive'
  count: number;
  purchasedAt: Timestamp | AdminTimestamp;
  packageBookingId?: string; // The ID of the booking that granted these credits
>>>>>>> before-product-selection-rewrite
}
