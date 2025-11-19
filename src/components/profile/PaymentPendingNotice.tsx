
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { contactEmail } from "@/config/site";
import Link from "next/link";
import { cn } from "@/lib/utils";


interface PaymentPendingNoticeProps {
  bookingId: string;
  onDismiss: (bookingId: string) => void;
}

export function PaymentPendingNotice({ bookingId, onDismiss }: PaymentPendingNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const handleDismissPermanently = () => {
    onDismiss(bookingId);
    setIsVisible(false); // Hide it immediately as well
  };
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="mb-4 bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    Payment Awaiting Confirmation
                </span>
            </div>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailsVisible(!detailsVisible)}
                className="text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
              >
                {detailsVisible ? "Hide Details" : "Show Details"}
                {detailsVisible ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
        </div>

        <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            detailsVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
            <div className="pt-2 border-t border-blue-500/10 space-y-3">
                 <p className="text-sm text-blue-700 dark:text-blue-400">
                  Thank you for your payment! Our system is now automatically confirming your transaction. Your booking status will be updated to 'Confirmed' on your dashboard, usually within a few minutes. We guarantee confirmation within 2-3 hours.
                </p>
                 <p className="text-sm text-blue-700 dark:text-blue-400">
                  If you have any questions or experience delays, please don't hesitate to contact us at{' '}
                  <a href={`mailto:${contactEmail}`} className="font-semibold underline">{contactEmail}</a>. You can also review our{' '}
                  <Link href="/faq" className="font-semibold underline">FAQ</Link> or{' '}
                  <Link href="/terms" className="font-semibold underline">Terms of Service</Link>.
                </p>
            </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-blue-500/10">
            <Button onClick={handleDismissPermanently} size="sm" variant="outline" className="text-xs">Dismiss Permanently</Button>
            <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="text-xs">
                Close
            </Button>
        </div>
    </div>
  );
}
