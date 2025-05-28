
import { BookingCalendar } from "@/components/bookings/booking-calendar";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Lesson',
  description: 'Schedule your Amharic language lesson with Amharic Connect.',
};

export default function BookingsPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Book Your Amharic Lesson
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Select a date and time that works best for you.
        </p>
      </header>
      <BookingCalendar />
    </div>
  );
}
