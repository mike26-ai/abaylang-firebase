
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
  {
    question: "What if I'm not satisfied with the trial?",
    answer: "Our goal is to ensure you have a great experience. The trial is designed to prevent this, but if you're not satisfied, we'd appreciate your feedback. There is no cost for the trial, so you lose nothing by trying it out.",
  },
  
  // Booking, Rescheduling & Cancellations
  {
    question: "How does the booking process work?",
    answer: "Our booking system is based on the tutor's live availability. Simply select an open time slot on the calendar, and your lesson is confirmed instantly. You'll receive an email confirmation with the lesson link right away—no need to wait for manual acceptance.",
  },
  {
    question: "How do I reschedule a lesson?",
    answer: "You can reschedule any lesson free of charge up to 24 hours before the scheduled start time. To do so, please go to your student dashboard, find the upcoming booking, and select the option to cancel it. Then, you can book a new slot that works better for you.",
  },
  {
    question: "What is the cancellation policy?",
    answer: "We offer free cancellation and rescheduling up to 24 hours before your lesson's start time. Cancellations made within the 24-hour window are not eligible for a refund or credit, as that time slot has been reserved for you.",
  },
  {
    question: "What happens if I miss my lesson?",
    answer: "If a student misses a lesson without prior notice, it is considered a completed session, and no refund or reschedule will be offered. We encourage you to cancel or reschedule at least 24 hours in advance if you know you can't make it.",
  },
  {
    question: "What happens if the tutor misses a lesson?",
    answer: "In the rare event the tutor has to cancel a lesson due to an emergency, you will be notified immediately. You will be offered a full credit to reschedule the lesson at your convenience or a full refund for that session, whichever you prefer.",
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
  {
    question: "I already purchased classes. How do I switch to a subscription plan?",
    answer: "Currently, we offer lesson packages. Once our subscription plan is launched, we will provide clear instructions on how existing students can transition. Please contact us for assistance when the time comes.",
  },
  {
    question: "How do I cancel a subscription plan?",
    answer: "Once subscriptions are available, you will be able to manage your plan, including pausing or cancelling, directly from your student dashboard. Cancellation will be effective at the end of your current billing cycle.",
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
