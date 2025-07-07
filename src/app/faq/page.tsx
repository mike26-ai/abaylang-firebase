// File: src/app/faq/page.tsx

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { contactEmail } from "@/config/site"; // We import the email from our config file

// Here are the 10 FAQs as requested.
const faqData = [
  {
    question: "How are the lessons structured?",
    answer: "Each lesson is tailored to you! We'll start with a quick chat, move to the main topic using PowerPoint slides, and finish with conversational practice to help you use what you've learned.",
  },
  {
    question: "How does the booking process work?",
    answer: "You can book a lesson directly from the 'Packages' or 'Bookings' page. Simply choose a lesson type, select an available time slot on the calendar, and confirm your booking. You'll receive an email confirmation with all the details.",
  },
  {
    question: "How does the free trial work?",
    answer: "Every new student is entitled to one free 30-minute trial lesson (either private or group). This allows you to meet the tutor, see the teaching style, and decide if it's right for you before committing.",
  },
  {
    question: "Do I need to know any Amharic to start?",
    answer: "Not at all! Lessons are available for all levels, from absolute beginners with no prior knowledge to intermediate learners looking to improve their fluency.",
  },
  {
    question: "What should I bring to a lesson?",
    answer: "Just bring yourself and a positive attitude! Make sure you have a stable internet connection, a microphone, and a device (computer or tablet recommended). All lesson materials (PowerPoint slides) will be provided by the tutor.",
  },
  {
    question: "What is the cancellation policy?",
    answer: "You can cancel or reschedule your lesson up to 24 hours before the scheduled start time for a full refund or credit. Cancellations made within 24 hours are not eligible for a refund.",
  },
  {
    question: "How do you handle time zones and scheduling?",
    answer: "The booking calendar should automatically display available times in your local time zone. If you need a specific time that isn't listed, please reach out directly. Our hours are flexible!",
  },
  {
    question: "How do group sessions work?",
    answer: "Group sessions consist of 2-5 students. They are a great way to learn in a collaborative environment and practice conversation with other learners. The cost is lower per student, and it’s a fun, interactive setting.",
  },
  {
    question: "Is the platform safe?",
    answer: "Yes, your privacy and safety are a top priority. All payments are handled through a secure processor, and your personal information is kept confidential.",
  },
  {
    question: "How can I contact the tutor directly?",
    answer: `The best way to get in touch is by email. You can send your questions to: ${contactEmail}.`,
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about lessons, booking, and more.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqData.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-lg">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}