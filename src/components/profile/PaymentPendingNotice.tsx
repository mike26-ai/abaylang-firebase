
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
import { contactEmail } from "@/config/site";
import Link from "next/link";


interface PaymentPendingNoticeProps {
  bookingId: string;
  onDismiss: (bookingId: string) => void;
}

export function PaymentPendingNotice({ bookingId, onDismiss }: PaymentPendingNoticeProps) {
  const [value, setValue] = useState<string | undefined>();

  const handleDismissPermanently = () => {
    onDismiss(bookingId);
    setValue(undefined); // Close it after dismissing
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
                  Thank you for your payment! Our system is now automatically confirming your transaction. Your booking status will be updated to 'Confirmed' on your dashboard, usually within a few minutes. We guarantee confirmation within 2-3 hours.
                </p>
                 <p className="text-sm text-blue-700 dark:text-blue-400">
                  If you have any questions or experience delays, please don't hesitate to contact us at{' '}
                  <a href={`mailto:${contactEmail}`} className="font-semibold underline">{contactEmail}</a>. You can also review our{' '}
                  <Link href="/faq" className="font-semibold underline">FAQ</Link> or{' '}
                  <Link href="/terms" className="font-semibold underline">Terms of Service</Link>.
                </p>
                <div className="flex gap-2">
                    <Button onClick={handleDismissPermanently} size="sm">Dismiss Permanently</Button>
                    <Button onClick={() => setValue(undefined)} variant="ghost" size="sm">
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
