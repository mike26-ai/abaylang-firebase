
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import type { AccordionSingleProps } from "@radix-ui/react-accordion";

interface PaymentPendingNoticeProps {
  bookingId: string;
  onDismiss: (bookingId: string) => void;
}

export function PaymentPendingNotice({ bookingId, onDismiss }: PaymentPendingNoticeProps) {
  const [value, setValue] = useState("item-1");

  if (!value) {
    return null; // The accordion is closed, render nothing more.
  }

  const handleDismissPermanently = () => {
    onDismiss(bookingId);
    setValue(""); // Close it after dismissing
  };

  return (
    <div className="mb-4">
      <Accordion 
        type="single" 
        collapsible 
        value={value} 
        onValueChange={setValue} 
        className="w-full bg-blue-500/5 border border-blue-500/20 rounded-lg"
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-blue-800 dark:text-blue-300 hover:no-underline">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Payment Awaiting Confirmation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Thank you for your payment! Our system is now automatically confirming your transaction. Your booking status will be updated to 'Confirmed' on this dashboard, usually within a few minutes. We guarantee confirmation within 2-3 hours. If your booking isn't confirmed by then, you are entitled to a full refund or a free lesson credit. Please contact support if you experience any delays.
                </p>
                <div className="flex gap-2">
                    <Button onClick={handleDismissPermanently} size="sm">Dismiss Permanently</Button>
                    <Button onClick={() => setValue("")} variant="ghost" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Close
                    </Button>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
