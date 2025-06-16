
import type React from "react";
import { LayoutDashboard, CalendarCheck, Star, Mail, LibraryBig, PackageIcon, Users, BookOpen } from "lucide-react"; // Added BookOpen

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
    { title: "About", href: "/#about", isSectionAnchor: true },
    // { title: "Lessons", href: "/#lessons", isSectionAnchor: true }, // Covered by booking
    { title: "Packages", href: "/packages", icon: PackageIcon }, // Simple pricing/package info
    // { title: "Resources", href: "/resources" }, // Deferred for MVP
    { title: "Reviews", href: "/#testimonials", isSectionAnchor: true },
    // {
    //   title: "More",
    //   href: "/more",
    //   children: [
    //     { title: "News & Updates", href: "/news" },
    //     { title: "Learning Blog", href: "/blog" },
    //   ],
    // }, // Deferred for MVP
    { title: "Contact", href: "/#contact", isSectionAnchor: true },
    { title: "Book a Lesson", href: "/bookings", authRequired: true },
    // { title: "Chat Room", href: "/chat", authRequired: true }, // Deferred for MVP
    // { title: "Accent Helper", href: "/accent-improvement", authRequired: true }, // Deferred for MVP
  ] satisfies NavItem[],
  userNav: [
    { title: "My Dashboard", href: "/profile", authRequired: true, icon: LayoutDashboard },
    { title: "Book New Lesson", href: "/bookings", authRequired: true, icon: CalendarCheck },
    // { title: "Submit Testimonial", href: "/testimonials", authRequired: true }, // Simplified - may submit from profile
  ] satisfies NavItem[],
  adminNav: [
    { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Manage Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { title: "Manage Students", href: "/admin/students", icon: Users },
    { title: "Manage Testimonials", href: "/admin/testimonials", icon: Star }, // Keep for basic approval
    // { title: "View Inquiries", href: "/admin/inquiries", icon: Mail }, // Rely on email for MVP
    // { title: "Manage Materials", href: "/admin/materials", icon: LibraryBig }, // Deferred for MVP
  ] satisfies NavItem[],
  footerNav: [
     { title: "Privacy Policy", href: "/privacy" },
     { title: "Terms of Service", href: "/terms" },
     { title: "FAQ", href: "/faq" },
  ]
};

export const tutorInfo = {
  name: "Mahir Abas Mustefa",
  bio: "ሰላም! I'm Mahir, a passionate Amharic teacher dedicated to helping diaspora learners reconnect with their Ethiopian heritage through language. Born and raised in Addis Ababa, I understand the unique challenges faced by second and third-generation Ethiopians abroad. With over 5 years of teaching experience and a deep love for Ethiopian culture, I create personalized learning experiences that go beyond grammar and vocabulary. My lessons incorporate cultural context, traditional stories, and real-world conversations that help you feel confident speaking with family and community.",
  shortIntro: "Native Amharic Speaker & Cultural Ambassador",
  teachingStyle: "Interactive conversation, grammar in context, cultural insights, personalized feedback. My goal is to make learning Amharic engaging, relevant, and enjoyable for all students, helping them not only speak the language but also understand the rich cultural tapestry of Ethiopia.",
  services: ["One-on-one lessons", "Group classes (coming soon)", "Accent coaching", "Cultural Immersion sessions"],
  imageUrl: "https://placehold.co/400x400.png",
  dataAiHint: "tutor portrait",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@lissanhub.example.com";
