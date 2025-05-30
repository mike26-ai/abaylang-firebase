
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
    { title: "Lessons", href: "/#lessons", isSectionAnchor: true },
    { title: "Resources", href: "/resources" },
    { title: "Reviews", href: "/#testimonials", isSectionAnchor: true },
    {
      title: "More",
      href: "/more",
      children: [
        { title: "News & Updates", href: "/news" },
        { title: "Learning Blog", href: "/blog" },
      ],
    },
    { title: "Contact", href: "/#contact", isSectionAnchor: true },
    { title: "Book a Lesson", href: "/bookings", authRequired: true },
    { title: "Chat Room", href: "/chat", authRequired: true },
    { title: "Accent Helper", href: "/accent-improvement", authRequired: true },
    { title: "Messages", href: "/messages", authRequired: true }, // Added for the new 1-on-1 messages page
  ] satisfies NavItem[],
  userNav: [
    { title: "Dashboard", href: "/profile", authRequired: true },
    { title: "Messages", href: "/messages", authRequired: true },
    { title: "Testimonials", href: "/testimonials", authRequired: true },
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
     { title: "FAQ", href: "/faq" },
  ]
};

export const tutorInfo = {
  name: "Mahir Abas Mustefa",
  bio: "ሰላም! I'm Mahir, a passionate Amharic teacher dedicated to helping diaspora learners reconnect with their Ethiopian heritage through language. Born and raised in Addis Ababa, I understand the unique challenges faced by second and third-generation Ethiopians abroad. With over 5 years of teaching experience and a deep love for Ethiopian culture, I create personalized learning experiences that go beyond grammar and vocabulary. My lessons incorporate cultural context, traditional stories, and real-world conversations that help you feel confident speaking with family and community.",
  shortIntro: "Native Amharic Speaker & Cultural Ambassador",
  teachingStyle: "Interactive conversation, grammar in context, cultural insights, personalized feedback. My goal is to make learning Amharic engaging, relevant, and enjoyable for all students, helping them not only speak the language but also understand the rich cultural tapestry of Ethiopia.",
  services: ["One-on-one lessons", "Group classes (coming soon)", "Accent coaching", "Cultural Immersion sessions"],
  imageUrl: "https://placehold.co/400x400.png", // YOU NEED TO REPLACE THIS
  dataAiHint: "tutor portrait",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video - YOU NEED TO REPLACE THIS
};

// Source ADMIN_EMAIL from environment variable with a fallback for easier setup/dev
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@lissanhub.example.com"; // YOU NEED TO SET NEXT_PUBLIC_ADMIN_EMAIL in your environment
