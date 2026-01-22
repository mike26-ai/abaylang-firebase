
// File: src/app/group-sessions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock, Tag, PlusCircle, AlertCircle } from 'lucide-react';
import { getGroupSessions } from '@/services/groupSessionService';
import type { GroupSession } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { createBooking } from '@/services/bookingService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProductId } from '@/config/products';

export default function GroupSessionsPage() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchSessions() {
      setIsLoading(true);
      try {
        const fetchedSessions = await getGroupSessions();
        setSessions(fetchedSessions);
      } catch (error: any) {
        toast({
          title: 'Error Fetching Sessions',
          description: error.message || 'Could not load available group sessions.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, [toast]);

  const handleBookSession = async (session: GroupSession) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to book a session.' });
      router.push('/login?callbackUrl=/group-sessions');
      return;
    }
    setIsBooking(session.id);
    try {
      const { bookingId, redirectUrl } = await createBooking({
        productId: (session.title.toLowerCase().includes('quick') ? 'quick-group-conversation' : 'immersive-conversation-practice') as ProductId,
        userId: user.uid,
        groupSessionId: session.id,
        date: format((session.startTime as any).toDate(), 'yyyy-MM-dd'),
        time: format((session.startTime as any).toDate(), 'HH:mm'),
      });
      
      // Redirect to Paddle for payment
       window.location.href = redirectUrl;

    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Could not book this session. Please try again.',
        variant: 'destructive',
      });
      setIsBooking(null);
    }
  };

  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Join a Group Session
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice your Amharic with fellow learners in a supportive, small-group environment led by Mahder.
        </p>
      </header>

       <Card className="mb-8 bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Looking for a Private Group Lesson?</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Want to learn with just your family or friends? You can book a private session for your own group.</p>
                </div>
                <Button asChild>
                    <Link href="/bookings/private-group">
                        <PlusCircle className="mr-2 h-4 w-4" /> Book a Private Group
                    </Link>
                </Button>
            </CardContent>
        </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-16 shadow-lg">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No Upcoming Sessions</CardTitle>
            <CardDescription>There are no public group sessions scheduled at the moment. Please check back later!</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session) => {
            const isFull = session.participantCount >= session.maxStudents;
            return (
              <Card key={session.id} className="flex flex-col shadow-lg">
                <CardHeader>
                  <CardTitle>{session.title}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format((session.startTime as any).toDate(), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{format((session.startTime as any).toDate(), 'p')} ({session.duration} mins)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.participantCount} / {session.maxStudents} spots filled
                    </span>
                    {isFull ? <Badge variant="destructive">Full</Badge> : <Badge variant="secondary">{session.maxStudents - session.participantCount} spots left</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="font-semibold text-primary">${session.price} per person</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleBookSession(session)} disabled={isFull || isBooking === session.id}>
                    {isBooking === session.id ? <Spinner size="sm" className="mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {isBooking === session.id ? 'Processing...' : 'Book Your Spot'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

