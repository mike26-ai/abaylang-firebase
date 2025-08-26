
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
  const price = searchParams.get('price');
  const studentEmail = searchParams.get('email');

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
          <CardTitle className="text-3xl font-bold text-foreground">Your Slot is Temporarily Held!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Please complete your payment to confirm your booking.</CardDescription>
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
          
           <Alert className="border-primary/30 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="font-bold text-primary">Important Policy Information</AlertTitle>
              <AlertDescription>
                Your booking will be confirmed within **12 business hours** after we receive your payment. Please read our full <Link href="/faq#payment-policy" className="underline font-semibold hover:text-primary/80">Booking & Payment Policy</Link> for details on confirmation times and our refund guarantee.
              </AlertDescription>
            </Alert>


          <div className="text-center bg-primary/5 p-6 rounded-lg border border-primary/20">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-semibold text-xl text-foreground mb-2">Complete Your Booking</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              To confirm your lesson, please send a payment of <strong>${price}</strong> via your preferred method. After sending, please go to your dashboard and mark the payment as sent.
            </p>
            <div className="space-y-3 text-foreground font-medium bg-background border p-4 rounded-md">
               <div>
                    <h3 className="font-semibold">PayPal:</h3>
                    <p className="font-normal text-muted-foreground">paypal.me/yourusername</p>
               </div>
                <div>
                    <h3 className="font-semibold">Zelle / Cash App:</h3>
                    <p className="font-normal text-muted-foreground">your-email@example.com or $yourtag</p>
                </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong className="font-semibold flex items-center justify-center gap-1.5"><Star className="w-4 h-4" /> IMPORTANT:</strong> For faster confirmation, please include the email address you used to register (<strong className="font-bold">{studentEmail}</strong>) in the payment note/memo.
                </p>
            </div>
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
