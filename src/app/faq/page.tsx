
// File: src/app/faq/page.tsx

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { contactEmail } from "@/config/site"; 

const faqData = [
  // Getting Started & Trials
  {
    question: "How do I get started?",
    answer: "Getting started is easy! First, we recommend booking a free 30-minute trial lesson to meet the tutor and discuss your goals. After that, you can choose from individual lessons or discounted packages on our 'Packages' page and book a time that works for you.",
  },
  {
    question: "What happens after my free trial?",
    answer: "The trial is a no-obligation session. If you enjoyed it and wish to continue, you can purchase single lessons or a package. If you decide it's not the right fit, there's absolutely no pressure to continue.",
  },
  
  // Booking, Rescheduling & Cancellations
  {
    question: "How does the booking process work?",
    answer: "Simply choose a lesson or package, select an available date and time from the calendar, and submit your booking request. You will then receive a secure invoice via email to confirm your spot. Your lesson is officially confirmed once the payment is complete.",
  },
  {
    question: "What is your cancellation and refund policy?",
    answer: "We have a simple and fair policy. You can receive a **full refund** or **reschedule for free** as long as you cancel at least **12 hours before** your scheduled lesson time. Cancellations made within the 12-hour window before a lesson are not eligible for a refund, as that time has been reserved for you.",
  },
  {
    question: "How do I reschedule a lesson?",
    answer: "To reschedule, please cancel your existing booking at least 12 hours in advance via your student dashboard or by contacting us. You will receive a credit or refund, which you can then use to book a new time slot that works for you.",
  },
  {
    question: "What happens if I miss my lesson?",
    answer: "If a student misses a lesson without providing at least 12 hours notice, it is considered a completed session and no refund will be offered. We strongly encourage you to reschedule in advance if you know you cannot make it.",
  },
  {
    question: "What happens if the tutor misses a lesson?",
    answer: "In the very rare event the tutor has to cancel a lesson due to an emergency, you will be notified immediately. You will be offered the choice of a full refund for that session or a free credit to reschedule at your convenience.",
  },

  // Packages & Subscriptions
  {
    question: "What are the packages or subscription models available?",
    answer: "We offer packages of lessons (e.g., 5 or 10 lessons) at a discounted rate compared to buying them individually. We are also planning to introduce a subscription model in the future for regular, ongoing lessons. You can see all current options on the 'Packages' page.",
  },
  {
    question: "Do lesson packages expire?",
    answer: "Yes, to ensure you stay on track with your learning, our standard lesson packages are valid for 6 months from the date of purchase. This gives you plenty of flexibility to schedule your lessons.",
  },
  
  // Lessons & Platform
  {
    question: "Do you offer specialized lessons for kids?",
    answer: "Yes! We love teaching young learners. Our lessons for children are designed to be fun, engaging, and interactive, using games and age-appropriate materials to make learning Amharic an exciting adventure. Please mention your child's age when booking.",
  },
  {
    question: "What device is recommended for the best experience?",
    answer: "For the best learning experience, we recommend using a computer or a tablet with a stable internet connection. This allows you to see the lesson materials and the tutor clearly. A smartphone can work, but a larger screen is ideal.",
  },
  
  // About ABYLANG
  {
    question: "What is the meaning of ABYLANG?",
    answer: "ABYLANG stands for 'Abyssinian Language'. 'ABY' is also a nod to the Abay River (the Blue Nile), which originates in Ethiopia, symbolizing the deep cultural roots and source of the language. It represents our mission to connect you to the heart of Ethiopian heritage.",
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
