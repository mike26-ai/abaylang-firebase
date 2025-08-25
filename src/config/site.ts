
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

// [UPDATED] - Site name and description changed to ABYLANG.
export const siteConfig = {
  name: "ABYLANG",
  description: "Connect to Ethiopian language and culture with Mahder Negash Mamo, a seasoned Amharic tutor offering live online lessons and cultural immersion through ABYLANG.",
  url: "https://abylang.com", // [UPDATED] - Domain updated for new brand
  mainNav: [
    { title: "Home", href: "/" },
    { title: "About Tutor", href: "/tutor-profile", icon: Users },
    { title: "Packages", href: "/packages", icon: Package },
    { title: "Testimonials", href: "/testimonials", icon: Star },
    {
      title: "Resources",
      href: "/resources",
      icon: LibraryBig,
      children: [
        { title: "Flashcards", href: "/flashcards", icon: BookOpen },
      ]
    },
    { title: "FAQ", href: "/faq", icon: HelpCircle },
    { title: "Contact", href: "/contact", icon: Mail },
  ] satisfies NavItem[],
  userNav: [ // For logged-in user dropdown
    { title: "My Dashboard", href: "/profile", authRequired: true, icon: LayoutDashboard },
    { title: "Book New Lesson", href: "/bookings", authRequired: true, icon: CalendarCheck },
  ] satisfies NavItem[],
  adminNav: [
    { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Manage Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { title: "Manage Students", href: "/admin/students", icon: Users },
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

// [UPDATED] - Tutor profile details updated for Mahder Negash Mamo.
export const tutorInfo = {
  name: "Mahder Negash Mamo",
  bio: "Experienced Amharic teacher who makes language learning fun, simple, and interactive. Join me for easy lessons packed with culture and conversation!",
  shortIntro: "Professional Amharic Tutor for Learners Worldwide",
  teachingStyle: "My teaching style is patient, interactive, and tailored to each student's pace and goals. I use a mix of conversational practice, structured exercises, and cultural insights to make learning both effective and enjoyable.",
  services: [
    "1-on-1 Personalized Lessons",
    "Group Conversation Classes",
    "Beginner to Advanced Levels",
    "Accent & Pronunciation Coaching"
  ],
  languages: ["Amharic", "English"],
  experience: "5+ years",
  imageUrl: "https://placehold.co/400x400.png",
  dataAiHint: "tutor portrait",
  videoUrl: "https://www.youtube.com/embed/your_video_id_here", // NOTE: Replace with actual video if available.
};

// [UPDATED] - Default admin email updated for new brand.
// Ensure this email is set in your environment variables for admin checks.
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "mahdernmamo@gmail.com";

export const contactEmail = "mahdernmamo@gmail.com";
