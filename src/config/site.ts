
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
  name: "ABYLANG",
  description: "Connect to Ethiopian language and culture with Mahder Negash Mamo, a seasoned Amharic tutor offering live online lessons and cultural immersion through ABYLANG.",
  url: "https://abylang.example.com",
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
  userNav: [
    { title: "My Dashboard", href: "/profile", authRequired: true, icon: LayoutDashboard },
    { title: "Book New Lesson", href: "/bookings", authRequired: true, icon: CalendarCheck },
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
  name: "Mahder Negash Mamo",
  bio: "Experienced Amharic teacher who makes language learning fun, simple, and interactive. Join me for easy lessons packed with culture and conversation!",
  languages: ["Amharic", "English"],
  experience: "5+ years",
  imageUrl: "/tutor/mahder-profile.jpg",
  dataAiHint: "tutor portrait of Mahder Negash Mamo",
  videoUrl: "https://www.youtube.com/embed/your_video_id_here",
};

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@abylang.example.com";
