// File: src/components/bookings/time-slot.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TimeOff, Booking } from "@/lib/types";
import { Lock, Info, User } from "lucide-react";

type TimeSlotStatus = 'available' | 'blocked' | 'booked';

export interface TimeSlotProps {
  value: string; // "09:00"
  display: string; // "09:00 - 09:30"
  status: TimeSlotStatus;
  bookedMeta?: Partial<Booking>; // Information about the booking
  blockedMeta?: Partial<TimeOff>; // Information about the time off block
  onClick?: (slot: TimeSlotProps) => void;
  isSelected?: boolean;
  isAdminView?: boolean;
}

export function TimeSlot({
  value,
  display,
  status,
  bookedMeta,
  blockedMeta,
  onClick,
  isSelected = false,
  isAdminView = false,
}: TimeSlotProps) {
  
  const isClickable = status === 'available' || (isAdminView && status === 'blocked');
  
  const getButtonContent = () => {
    switch (status) {
      case 'blocked':
        return (
          <span className="flex items-center">
            <Lock className="w-3 h-3 mr-1.5" />
            Busy
          </span>
        );
      case 'booked':
        return isAdminView ? `Booked: ${bookedMeta?.userName}` : "Booked";
      case 'available':
      default:
        return display;
    }
  };

  const button = (
    <Button
      variant={isSelected ? 'default' : status === 'available' ? 'outline' : 'secondary'}
      className={cn(
        "w-full truncate",
        status === 'available' && "hover:bg-accent",
        status === 'blocked' && "bg-destructive/10 text-destructive-foreground hover:bg-destructive/20 font-semibold",
        status === 'booked' && "bg-blue-600/10 text-blue-800 dark:text-blue-300 border-blue-600/20 hover:bg-blue-600/20 line-through",
        !isClickable && "cursor-not-allowed"
      )}
      disabled={!isClickable}
      onClick={() => isClickable && onClick && onClick({ value, display, status, bookedMeta, blockedMeta, isSelected, isAdminView })}
    >
      {getButtonContent()}
    </Button>
  );

  if (status !== 'available') {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            {status === 'blocked' && (
              <div className="flex items-start gap-2 p-1">
                <Lock className="w-4 h-4 mt-0.5"/>
                <div>
                    <p className="font-semibold">Tutor Unavailable</p>
                    {blockedMeta?.note && blockedMeta.note !== 'Admin Block' && <p className="text-xs text-muted-foreground">Note: {blockedMeta.note}</p>}
                </div>
              </div>
            )}
            {status === 'booked' && (
              <div className="flex items-start gap-2 p-1">
                 <User className="w-4 h-4 mt-0.5"/>
                 <div>
                    <p className="font-semibold">Slot Already Booked</p>
                    {isAdminView && bookedMeta?.userName && <p className="text-xs text-muted-foreground">Student: {bookedMeta.userName}</p>}
                 </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
