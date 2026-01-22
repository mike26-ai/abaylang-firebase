
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format, addDays, isPast, startOfDay, isEqual } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

interface DateSelectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  toDate?: Date | undefined; // Optional upper limit for selectable dates
}

export function DateSelection({ selectedDate, onDateSelect, toDate }: DateSelectionProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // This is the safe place to generate date-based UI to avoid hydration mismatches.
    const today = startOfDay(new Date());
    const dates = Array.from({ length: 180 }, (_, i) => addDays(today, i));
    setAvailableDates(dates);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  const isDateDisabled = (dateOption: Date) => {
    // Disable past dates
    if (isPast(dateOption) && !isEqual(startOfDay(dateOption), startOfDay(new Date()))) {
      return true;
    }
    // Disable dates beyond the `toDate` if it's provided
    if (toDate && dateOption > toDate) {
      return true;
    }
    return false;
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {availableDates.map((dateOption) => (
        <Button
          key={dateOption.toISOString()}
          variant={selectedDate && isEqual(startOfDay(selectedDate), dateOption) ? "default" : "outline"}
          className="p-4 h-auto flex flex-col"
          onClick={() => onDateSelect(dateOption)}
          disabled={isDateDisabled(dateOption)}
        >
          <div className="text-sm">
            {format(dateOption, "E")}
          </div>
          <div className="font-semibold">
            {format(dateOption, "MMM d")}
          </div>
        </Button>
      ))}
    </div>
  );
}
