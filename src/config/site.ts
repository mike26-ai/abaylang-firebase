
import type React from "react";
import { LayoutDashboard, CalendarCheck, Star, Mail, LibraryBig, Users, FileText, BookOpen, Package, HelpCircle, MessageSquare } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
  adminRequired?: boolean;
  hideWhenLoggedIn?: boolean;
  isSectionAnchor?: boolean; // Used for homepage sections
  children?: NavItem[]; // For dropdowns
};

export const siteConfig = {
  name: "LissanHub",
  description: "Learn Amharic with native speakers. Personalized lessons and cultural immersion for diaspora and global learners.",
  url: "https://lissanhub.example.com", // Replace with your actual domain
  mainNav: [
    { title: "Home", href: "/" },
    { title: "About Tutor", href: "/tutor-profile", icon: Users },
    { title: "Packages", href: "/packages", icon: Package }, // Info-only for MVP
    { title: "Testimonials", href: "/testimonials", icon: Star },
    {
      title: "Resources",
      href: "/resources", // General landing for resources
      icon: LibraryBig,
      children: [
        { title: "Flashcards", href: "/flashcards", icon: BookOpen },
        // Lesson materials will be accessed via student dashboard if linked to bookings or general area
      ]
    },
    { title: "FAQ", href: "/faq", icon: HelpCircle },
    { title: "Contact", href: "/contact", icon: Mail },
    // "Book a Lesson" is a primary CTA, often directly linked or part of user/admin dashboard flow
  ] satisfies NavItem[],
  userNav: [ // For logged-in user dropdown
    { title: "My Dashboard", href: "/profile", authRequired: true, icon: LayoutDashboard },
    { title: "Book New Lesson", href: "/bookings", authRequired: true, icon: CalendarCheck },
    { title: "Submit Testimonial", href: "/profile#testimonials", authRequired: true, icon: Star }, // Link to section in profile for feedback
  ] satisfies NavItem[],
  adminNav: [
    { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Manage Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { title: "Manage Students", href: "/admin/students", icon: Users },
    { title: "Manage Materials", href: "/admin/materials", icon: FileText },
    { title: "Manage Testimonials", href: "/admin/testimonials", icon: Star },
    { title: "View Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  ] satisfies NavItem[],
  footerNav: [
     { title: "Privacy Policy", href: "/privacy" },
     { title: "Terms of Service", href: "/terms" },
     { title: "FAQ", href: "/faq" },
     { title: "Contact", href: "/contact" },
  ]
};

export const tutorInfo = {
  name: "Mahir Abas Mustefa",
  bio: "ሰላም! I'm Mahir, a passionate Amharic teacher dedicated to helping diaspora learners reconnect with their Ethiopian heritage through language. Born and raised in Addis Ababa, I understand the unique challenges faced by second and third-generation Ethiopians abroad. With over 5 years of teaching experience and a deep love for Ethiopian culture, I create personalized learning experiences that go beyond grammar and vocabulary. My lessons incorporate cultural context, traditional stories, and real-world conversations that help you feel confident speaking with family and community.",
  shortIntro: "Native Amharic Speaker & Cultural Ambassador",
  teachingStyle: "Interactive conversation, grammar in context, cultural insights, personalized feedback. My goal is to make learning Amharic engaging, relevant, and enjoyable for all students, helping them not only speak the language but also understand the rich cultural tapestry of Ethiopia.",
  services: ["One-on-one lessons", "Cultural Immersion sessions"],
  imageUrl: "https://placehold.co/400x400.png",
  dataAiHint: "tutor portrait",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example video
};

// Ensure this email is set in your environment variables for admin checks.
// This is used by useAuth hook to determine isAdmin status.
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@lissanhub.example.com";

// Default booking duration and price for MVP if not specified per lesson type
export const defaultLessonConfig = {
  duration: 60, // minutes
  price: 45, // USD
  currency: "USD",
};
