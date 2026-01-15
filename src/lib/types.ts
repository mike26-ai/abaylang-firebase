

import type { Timestamp } from "firebase/firestore";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

export interface Booking {
  id: string;
  userId: string; // This must match security rules
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD format
  time: string;
  status: "awaiting-payment" | "payment-pending-confirmation" | "confirmed" | "cancelled" | "completed" | "cancellation-requested" | "refunded" | "credit-issued" | "cancelled-by-admin" | "rescheduled" | "in-progress" | "no-show";
  tutorId: string;
  tutorName: string;
  createdAt: Timestamp | AdminTimestamp;
  updatedAt?: Timestamp | AdminTimestamp; // For tracking updates like rescheduling
  startTime?: Timestamp | AdminTimestamp | null;
  endTime?: Timestamp | AdminTimestamp | null;
  // Optional fields
  lessonNotes?: string;
  duration?: number; // in minutes
  lessonType?: string;
  price?: number;
  learningGoals?: string;
  hasReview?: boolean; // Added for student dashboard
  cancellationReason?: string; // For reschedule/cancellation data
  paymentNote?: string; // Note from student (e.g., transaction ID)
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
  createdAt: Timestamp | AdminTimestamp;
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
  lessonId?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Timestamp | AdminTimestamp;
  read: boolean;
}

// User profile data stored in Firestore
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt: Timestamp | AdminTimestamp;
  nativeLanguage?: string;
  country?: string;
  amharicLevel?: string;
  photoURL?: string | null;
  showFirstLessonFeedbackPrompt?: boolean;
  hasSubmittedFirstLessonFeedback?: boolean;
  credits?: UserCredit[];
  lastCreditPurchase?: Timestamp | AdminTimestamp;
}

export interface ChatMessage {
  id: string; // Firestore document ID
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  timestamp: Timestamp | AdminTimestamp;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribedAt: Timestamp | AdminTimestamp;
}

export interface LearningLesson {
  id: string;
  title: string;
  type: "video" | "interactive" | "quiz" | "reading";
  duration: number; // minutes
  status: "completed" | "in-progress" | "not-started" | "locked";
}

export interface LearningModule {
  id:string;
  title: string;
  description: string;
  order: number;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  lessons: LearningLesson[];
}


export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp | AdminTimestamp;
  status: "pending" | "submitted" | "graded" | "late";
  feedback?: string;
  grade?: string;
  createdAt?: Timestamp | AdminTimestamp;
}

export interface HomeworkSubmissionType {
  id?: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submissionText: string;
  submittedAt: Timestamp | AdminTimestamp;
  status: "submitted" | "graded" | "late_submission";
  feedback?: string;
  grade?: string;
}

export interface LessonMaterial {
  id: string;
  title: string;
  description: string;
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
}
