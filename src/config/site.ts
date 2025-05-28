
export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
  adminRequired?: boolean;
  hideWhenLoggedIn?: boolean;
  isSectionAnchor?: boolean;
  children?: NavItem[]; // Added for dropdown support
};

export const siteConfig = {
  name: "LissanHub",
  description: "Learn Amharic with native speakers. Personalized lessons and cultural immersion for diaspora and global learners.",
  url: "https://lissanhub.example.com",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "About", href: "/#about", isSectionAnchor: true },
    { title: "Lessons", href: "/#lessons", isSectionAnchor: true },
    { title: "Reviews", href: "/#testimonials", isSectionAnchor: true },
    { title: "Resources", href: "/resources" },
    {
      title: "More",
      href: "/more", // Fallback/main page for "More"
      children: [
        { title: "News & Updates", href: "/news" },
        { title: "Learning Blog", href: "/blog" },
      ],
    },
    { title: "Contact", href: "/#contact", isSectionAnchor: true },
    { title: "Book a Lesson", href: "/bookings", authRequired: true },
    { title: "Chat Room", href: "/chat", authRequired: true },
    { title: "Accent Helper", href: "/accent-improvement", authRequired: true },
  ] satisfies NavItem[],
  userNav: [
    { title: "Dashboard", href: "/profile", authRequired: true },
    { title: "Testimonials", href: "/testimonials", authRequired: true },
    { title: "Messages", href: "/messages", authRequired: true },
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
  bio: "ሰላም! I'm Mahir, a passionate Amharic teacher dedicated to helping diaspora learners reconnect with their Ethiopian heritage through language. Born and raised in Addis Ababa, I understand the unique challenges faced by second and third-generation Ethiopians abroad. With over 5 years of teaching experience and a deep love for Ethiopian culture, I create personalized learning experiences that go beyond grammar and vocabulary. My lessons incorporate cultural context, traditional stories, and real-world conversations that help you feel confident speaking with family and community.",
  shortIntro: "Native Amharic Speaker & Cultural Ambassador",
  teachingStyle: "Interactive conversation, grammar in context, cultural insights, personalized feedback. My goal is to make learning Amharic engaging, relevant, and enjoyable for all students, helping them not only speak the language but also understand the rich cultural tapestry of Ethiopia.",
  services: ["One-on-one lessons", "Group classes (coming soon)", "Accent coaching", "Cultural Immersion sessions"],
  imageUrl: "https://placehold.co/400x400.png",
  dataAiHint: "tutor portrait",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

export const ADMIN_EMAIL = "admin@lissanhub.example.com";
