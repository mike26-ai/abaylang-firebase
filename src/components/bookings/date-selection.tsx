
"use client";

import { Calendar } from "@/components/ui/calendar";
import { isPast, startOfDay, isEqual } from 'date-fns';

interface DateSelectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function DateSelection({ selectedDate, onDateSelect }: DateSelectionProps) {
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border p-0"
        disabled={(date) => isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))}
      />
    </div>
  );
}
