
export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
  adminRequired?: boolean;
  hideWhenLoggedIn?: boolean;
};

export const siteConfig = {
  name: "Amharic Connect",
  description: "Live, bookable Amharic language lessons for diaspora and global learners.",
  url: "https://amharicconnect.example.com", // Replace with your actual URL
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Tutor Profile", href: "/tutor-profile" },
    { title: "Book a Lesson", href: "/bookings", authRequired: true },
    { title: "Accent Helper", href: "/accent-improvement", authRequired: true },
    { title: "Contact", href: "/contact" },
  ] satisfies NavItem[],
  userNav: [
    { title: "Profile", href: "/profile", authRequired: true },
    { title: "My Bookings", href: "/profile#my-bookings", authRequired: true },
    { title: "Submit Testimonial", href: "/submit-testimonial", authRequired: true },
  ] satisfies NavItem[],
  adminNav: [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "Manage Bookings", href: "/admin/bookings" },
    { title: "Manage Testimonials", href: "/admin/testimonials" },
    { title: "View Inquiries", href: "/admin/inquiries" },
  ] satisfies NavItem[],
  footerNav: [
     { title: "Privacy Policy", href: "/privacy" },
     { title: "Terms of Service", href: "/terms" },
  ]
};

export const tutorInfo = {
  name: "Mahir Abas Mustefa",
  bio: "Experienced Amharic tutor passionate about helping learners connect with Ethiopian language and culture. My teaching style is interactive, personalized, and focuses on practical communication skills.",
  shortIntro: "Salam! I'm Mahir, your guide to mastering Amharic. Join me for engaging lessons tailored to your learning goals.",
  teachingStyle: "Interactive conversation, grammar in context, cultural insights, personalized feedback.",
  services: ["One-on-one lessons", "Group classes (coming soon)", "Accent coaching"],
  imageUrl: "https://placehold.co/300x300.png",
  dataAiHint: "teacher portrait",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
};

export const ADMIN_EMAIL = "admin@amharicconnect.example.com"; // Replace with actual admin email for role check
