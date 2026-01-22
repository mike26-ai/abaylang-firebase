
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Clock, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { getGroupSessions } from '@/services/groupSessionService';
import { createBooking } from '@/services/bookingService';
import type { GroupSession } from '@/lib/types';
import { format, isBefore } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export default function GroupSessionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonType = searchParams.get('lessonType');
  const { toast } = useToast();

  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      setIsLoading(true);
      try {
        const fetchedSessions = await getGroupSessions();
        const now = new Date();
        // Filter for relevant and upcoming sessions
        const relevantSessions = fetchedSessions.filter(s => {
          const startTime = (s.startTime as unknown as Timestamp).toDate();
          return isBefore(now, startTime);
        });
        setSessions(relevantSessions);
      } catch (error: any) {
        toast({
          title: 'Error Fetching Sessions',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, [toast]);

  const handleRegister = async (session: GroupSession) => {
    if (!user) {
        toast({ title: 'Login Required', description: 'Please log in to register for a session.', variant: 'destructive'});
        router.push(`/login?callbackUrl=/bookings/group?lessonType=${lessonType}`);
        return;
    }
    setIsBooking(session.id);
    try {
        const payload = {
            productId: lessonType as any,
            userId: user.uid,
            groupSessionId: session.id,
            date: format((session.startTime as unknown as Timestamp).toDate(), 'yyyy-MM-dd'),
            time: format((session.startTime as unknown as Timestamp).toDate(), 'HH:mm'),
        };
        const data = await createBooking(payload as any);
        
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        }

    } catch (error: any) {
        toast({ title: 'Registration Failed', description: error.message, variant: 'destructive'});
        setIsBooking(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
        <div className="mb-8">
            <Button variant="ghost" asChild>
                <Link href="/packages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Packages</Link>
            </Button>
        </div>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Upcoming Group Sessions</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Find a time that works for you and join fellow learners.</CardDescription>
      </CardHeader>
      
      {isLoading ? (
         <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : sessions.length > 0 ? (
        <div className="space-y-6 mt-8">
          {sessions.map(session => {
            const startTime = (session.startTime as unknown as Timestamp).toDate();
            const spotsLeft = session.maxStudents - session.participantCount;
            const canRegister = spotsLeft > 0;
            
            return (
              <Card key={session.id} className="shadow-lg">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">{session.title}</h3>
                        <p className="text-muted-foreground">{session.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                            <div className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {format(startTime, 'EEEE, MMMM d, yyyy')}</div>
                            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {format(startTime, 'p')}</div>
                            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {spotsLeft} spot(s) left</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl font-bold text-primary">${session.price}</div>
                        <Button onClick={() => handleRegister(session)} disabled={!canRegister || isBooking === session.id}>
                            {isBooking === session.id ? <Spinner size="sm" className="mr-2"/> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isBooking === session.id ? 'Processing...' : (canRegister ? 'Register Now' : 'Session Full')}
                        </Button>
                    </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">No upcoming group sessions scheduled at the moment. Please check back later!</p>
        </div>
      )}
    </div>
  );
}
