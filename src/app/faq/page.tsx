
import type { Metadata } from 'next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookQuestion } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description: 'Find answers to common questions about LissanHub, lessons, bookings, and more.',
};

const faqs = [
  {
    question: "How do I book a lesson?",
    answer: "You can book a lesson by navigating to the 'Book a Lesson' page from the main menu or your student dashboard. Select your preferred lesson type, date, and time, then confirm your booking."
  },
  {
    question: "What are the different types of lessons offered?",
    answer: "We offer Quick Practice (30 mins), Comprehensive Lessons (60 mins), and Cultural Immersion sessions (90 mins). Each caters to different learning needs and goals. Details can be found on the homepage and booking page."
  },
  {
    question: "Can I cancel or reschedule a lesson?",
    answer: "Yes, you can cancel or reschedule a lesson up to 24 hours before the scheduled start time. Please manage your bookings through your student dashboard. Late cancellations may be subject to a fee according to our terms."
  },
  {
    question: "How do I join my online lesson?",
    answer: "After booking, you'll receive a confirmation email with a Zoom link (or other specified platform link) for your lesson. Please ensure you have the necessary software installed and are ready a few minutes before your lesson starts."
  },
  {
    question: "What payment methods are accepted?",
    answer: "Currently, payment processing is simulated. In a real-world scenario, we would aim to accept major credit cards and other common online payment methods through a secure payment gateway like Stripe."
  },
  {
    question: "Does Mahir teach absolute beginners?",
    answer: "Yes! Mahir is experienced in teaching students of all levels, from complete beginners with no prior Amharic knowledge to advanced learners looking to refine their fluency and cultural understanding."
  },
  {
    question: "Are learning materials provided?",
    answer: "Yes, for Comprehensive and Cultural Immersion lessons, relevant learning materials, homework, and resources are often provided. Session recordings are also available for your review where applicable."
  },
  {
    question: "How does the AI Accent Helper work?",
    answer: "The AI Accent Helper uses generative AI to provide personalized suggestions for accent and pronunciation improvements. You can input Amharic text you've practiced, along with some profile information, and the tool will offer tips."
  },
  {
    question: "How are testimonials managed?",
    answer: "Students can submit testimonials after their lessons. These are reviewed by an admin before being published on the site to ensure authenticity and appropriateness."
  }
];

export default function FAQPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <BookQuestion className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find quick answers to common questions about LissanHub. If you don&apos;t find your answer here, please feel free to <a href="/contact" className="text-primary hover:underline">contact us</a>.
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border-b border-border last:border-b-0">
              <AccordionTrigger className="text-left hover:no-underline text-lg font-medium text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
