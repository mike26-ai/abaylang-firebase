
"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, User, Calendar, Clock, Tag, DollarSign, Wallet, Star, Info } from 'lucide-react';
import { tutorInfo } from '@/config/site';
import { format, parse } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonType = searchParams.get('lessonType');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const price = searchParams.get('price'); // This will be null for free trials now

  if (!lessonType) {
    if (typeof window !== 'undefined') {
        router.push('/bookings');
    }
    return (
        <div className="text-center text-muted-foreground">
            <p>Loading booking details...</p>
        </div>
    );
  }

  const isFreeTrial = price === null || parseFloat(price) === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-fade-in">
        <CardHeader className="text-center bg-accent/50 p-6 rounded-t-lg">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground">
            <CheckCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {isFreeTrial ? "Your Free Trial is Confirmed!" : "Your Slot is Held!"}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
             {isFreeTrial ? "We're excited to see you. Check your dashboard for details." : "Please complete your payment to confirm your booking."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground text-center">Booking Details</h3>
            <div className="border rounded-lg p-4 grid sm:grid-cols-2 gap-4 bg-background">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Lesson Type</div>
                  <div className="font-medium text-foreground">{lessonType}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Tutor</div>
                  <div className="font-medium text-foreground">{tutorInfo.name}</div>
                </div>
              </div>
              {date && time && date !== 'N/A_PACKAGE' && (
                 <>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-medium text-foreground">{format(parse(date, 'yyyy-MM-dd', new Date()), "PPP")}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                        <div className="text-sm text-muted-foreground">Time</div>
                        <div className="font-medium text-foreground">{time}</div>
                        </div>
                    </div>
                 </>
              )}
               {price && (
                <div className="flex items-center gap-3 sm:col-span-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                    <div className="text-sm text-muted-foreground">Total Price</div>
                    <div className="font-medium text-foreground">${price}</div>
                    </div>
                </div>
               )}
            </div>
             {date === 'N/A_PACKAGE' && (
                <p className="text-sm text-center text-muted-foreground">You've purchased a package! You can schedule your individual lessons from your dashboard.</p>
            )}
          </div>
          
           {!isFreeTrial && (
             <Alert className="border-primary/30 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold text-primary">Next Steps</AlertTitle>
                <AlertDescription>
                    To finalize your booking, please proceed to the payment page. Your booking will be confirmed within 12 business hours after payment.
                </AlertDescription>
            </Alert>
           )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
            <Button asChild>
              <Link href="/profile">
                Go to My Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bookings">Book Another Lesson</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingSuccessContent />
        </Suspense>
    )
}
