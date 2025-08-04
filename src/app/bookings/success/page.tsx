
"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, User, Calendar, Clock, Tag, DollarSign, Wallet } from 'lucide-react';
import { tutorInfo } from '@/config/site';
import { format, parse } from 'date-fns';
import { Badge } from '@/components/ui/badge';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonType = searchParams.get('lessonType');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const price = searchParams.get('price');

  if (!lessonType || !price) {
    // Handle case where params are missing, maybe redirect to booking page
    if (typeof window !== 'undefined') {
        router.push('/bookings');
    }
    return (
        <div className="text-center text-muted-foreground">
            <p>Loading booking details...</p>
        </div>
    );
  }

  const isPackage = date === 'N/A_PACKAGE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-fade-in">
        <CardHeader className="text-center bg-accent/50 p-6 rounded-t-lg">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground">
            <CheckCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Booking Request Sent!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Your lesson slot is now reserved.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground text-center">Your Booking Details</h3>
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
              {!isPackage && date && time && (
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
               <div className="flex items-center gap-3 sm:col-span-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Price</div>
                  <div className="font-medium text-foreground">${price}</div>
                </div>
              </div>
            </div>
             {isPackage && (
                <p className="text-sm text-center text-muted-foreground">You've purchased a package! You can schedule your individual lessons from your dashboard.</p>
            )}
          </div>

          <div className="text-center bg-primary/5 p-6 rounded-lg border border-primary/20">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-xl text-foreground mb-2">Complete Your Booking</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              To confirm your lesson, please send a payment of <strong>${price}</strong> via your preferred method. Your booking will be marked as 'Confirmed' once payment is received.
            </p>
            <div className="space-y-2 text-foreground font-medium">
               <p><strong>PayPal:</strong> paypal.me/yourusername</p>
               <p><strong>Zelle/Cash App:</strong> your-email@example.com or $yourtag</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Please include your name or email in the payment note for easier confirmation.</p>
          </div>

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
