
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format, addDays, isPast, startOfDay, isEqual } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

interface DateSelectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function DateSelection({ selectedDate, onDateSelect }: DateSelectionProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // This is the safe place to generate date-based UI to avoid hydration mismatches.
    const dates = Array.from({ length: 90 }, (_, i) => addDays(startOfDay(new Date()), i));
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

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {availableDates.map((dateOption) => (
        <Button
          key={dateOption.toISOString()}
          variant={selectedDate && isEqual(startOfDay(selectedDate), dateOption) ? "default" : "outline"}
          className="p-4 h-auto flex flex-col"
          onClick={() => onDateSelect(dateOption)}
          disabled={isPast(dateOption) && !isEqual(startOfDay(dateOption), startOfDay(new Date()))}
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
