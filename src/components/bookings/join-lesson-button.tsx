
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Video } from 'lucide-react';
import { parse, addMinutes, differenceInMinutes } from 'date-fns';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';

interface JoinLessonButtonProps {
  booking: Booking;
  className?: string;
}

export function JoinLessonButton({ booking, className }: JoinLessonButtonProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      if (!booking.date || !booking.time || !booking.duration) {
        setIsActive(false);
        return;
      }
      
      const now = new Date();
      const lessonStart = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
      const lessonEnd = addMinutes(lessonStart, booking.duration);
      
      // Button is active from 15 minutes before start until the lesson ends
      const shouldBeActive = differenceInMinutes(lessonStart, now) <= 15 && now < lessonEnd;
      setIsActive(shouldBeActive);
    };

    checkTime(); // Initial check
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [booking.date, booking.time, booking.duration]);

  if (!booking.zoomLink) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("w-full", className)}>
            <Button size="sm" asChild disabled={!isActive} className="w-full">
              <a href={booking.zoomLink} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-4 w-4" /> Join Lesson
              </a>
            </Button>
          </div>
        </TooltipTrigger>
        {!isActive && (
          <TooltipContent>
            <p>Button will be active 15 minutes before the lesson.</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
