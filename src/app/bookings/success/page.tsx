// File: src/app/bookings/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Ticket } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import { format, parse } from 'date-fns';
import { Spinner } from "@/components/ui/spinner";


export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const isFreeTrial = searchParams.get('free_trial') === 'true';
    const isSimulatedPayment = searchParams.get('simulated_payment') === 'true';
    const usedCredit = searchParams.get('used_credit') === 'true';
    const bookingId = searchParams.get('booking_id'); 

    const [bookingDetails, setBookingDetails] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) {
            setIsLoading(false);
            return;
        }

        const fetchBookingDetails = async () => {
            setIsLoading(true);
            try {
                const bookingDocRef = doc(db, "bookings", bookingId);
                const docSnap = await getDoc(bookingDocRef);
                if (docSnap.exists()) {
                    setBookingDetails(docSnap.data() as Booking);
                }
            } catch (error) {
                console.error("Error fetching booking details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId]);

    const getStatusInfo = () => {
        if (isFreeTrial) {
            return {
                icon: <CheckCircle className="h-10 w-10 text-primary" />,
                bgColor: "bg-primary/10",
                title: "Free Trial Confirmed!",
                description: "Your lesson has been successfully scheduled.",
                message: "You're all set! Your free trial has been scheduled. You can view the details in your dashboard. We look forward to seeing you!",
            };
        }
        
        if(usedCredit) {
             return {
                icon: <Ticket className="h-10 w-10 text-primary" />,
                bgColor: "bg-primary/10",
                title: "Booking Confirmed!",
                description: "You've successfully used a credit.",
                message: "Your lesson has been scheduled using one of your credits. You can view the details in your dashboard. We look forward to seeing you!",
            };
        }
        
         if (isSimulatedPayment) {
            return {
                icon: <CheckCircle className="h-10 w-10 text-primary" />,
                bgColor: "bg-primary/10",
                title: "Purchase Confirmed (Simulated)",
                description: "Your purchase has been successfully processed.",
                message: "This is a simulated payment confirmation for testing purposes. Your purchase has been logged and any credits have been added to your dashboard."
            };
        }
        
        // This message is for a real production environment where Paddle redirects back.
        return {
            icon: <Clock className="h-10 w-10 text-yellow-600" />,
            bgColor: "bg-yellow-500/10",
            title: "Payment Processing",
            description: "Your lesson is awaiting automatic confirmation.",
            message: "Thank you for your payment! The system is now confirming your transaction. Your booking status will be updated to 'Confirmed' on your dashboard automatically, usually within a minute.",
        };
    };

    const { icon, bgColor, title, description, message } = getStatusInfo();

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
            <Card className="w-full max-w-lg text-center shadow-xl">
                <CardHeader>
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${bgColor}`}>
                        {icon}
                    </div>
                    <CardTitle className="text-3xl">{title}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && bookingId ? (
                        <div className="flex justify-center py-4"><Spinner /></div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">{message}</p>
                            {bookingDetails && (
                                <div className="text-left bg-muted/50 p-4 rounded-md border text-sm">
                                    <h4 className="font-semibold mb-2 text-foreground">Booking Summary</h4>
                                    <div className="space-y-1">
                                        <p><span className="font-medium text-muted-foreground">Item:</span> {bookingDetails.lessonType || (bookingDetails.productType === 'package' ? 'Lesson Package' : 'Lesson')}</p>
                                        {bookingDetails.date !== 'N/A_PACKAGE' && bookingDetails.date && bookingDetails.time && (
                                            <p>
                                                <span className="font-medium text-muted-foreground">Date:</span> 
                                                {format(parse(bookingDetails.date, 'yyyy-MM-dd', new Date()), "PPP")} at {bookingDetails.time}
                                            </p>
                                        )}
                                         {bookingDetails.paymentNote && <p><span className="font-medium text-muted-foreground">Note:</span> {bookingDetails.paymentNote}</p>}
                                    </div>
                                </div>
                            )}
                            <Button asChild size="lg" className="mt-4">
                                <Link href="/profile">Go to My Dashboard</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
