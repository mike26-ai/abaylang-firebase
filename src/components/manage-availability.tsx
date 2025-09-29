
"use client";

import React, { useEffect, useState } from "react";
import { getAvailabilityWithBookings } from "@/services/availabilityService";

type Slot = {
  id: string;
  time: string;
  status: "available" | "busy" | "booked";
  student?: { name: string; package: string };
};

export default function ManageAvailability({ tutorId, isAdmin }: { tutorId: string; isAdmin?: boolean }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { availability, bookings } = await getAvailabilityWithBookings(tutorId);

        // Merge into slots
        const merged: Slot[] = availability.map((slot: any) => {
          const booking = bookings.find((b: any) => b.startISO === slot.startISO);
          if (booking) {
            return {
              id: slot.id,
              time: slot.startISO,
              status: "booked",
              student: isAdmin
                ? { name: booking.studentName, package: booking.package }
                : undefined
            };
          }
          return {
            id: slot.id,
            time: slot.startISO,
            status: slot.isBlocked ? "busy" : "available"
          };
        });

        setSlots(merged);
      } catch (err) {
        console.error("Error loading slots:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tutorId, isAdmin]);

  if (loading) return <p>Loading availability...</p>;

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className={`p-3 rounded-lg cursor-pointer transition-colors
            ${slot.status === "available" ? "bg-green-500 hover:bg-green-600"
              : slot.status === "busy" ? "bg-gray-400 hover:bg-gray-500"
              : "bg-blue-500 hover:bg-blue-600"}`}
          title={
            slot.status === "available"
              ? "Available for booking"
              : slot.status === "busy"
                ? "Tutor unavailable / busy"
                : isAdmin && slot.student
                  ? `Booked with ${slot.student.name} – ${slot.student.package} at ${slot.time}`
                  : "Booked"
          }
        >
          {slot.time}
        </div>
      ))}
    </div>
  );
}
