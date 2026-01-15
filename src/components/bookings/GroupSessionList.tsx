
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getGroupSessions } from '@/services/groupSessionService';
import type { GroupSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { CalendarDays, Clock, Users, Tag, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createBooking } from '@/services/bookingService';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import type { ProductId } from '@/config/products';

export function GroupSessionList() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSessions() {
      setIsLoading(true);
      try {
        const upcomingSessions = await getGroupSessions();
        setSessions(upcomingSessions);
      } catch (error: any) {
        toast({
          title: 'Error Fetching Group Sessions',
          description: error.message,
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
      toast({ title: 'Please log in', description: 'You must be logged in to book a session.' });
      router.push('/login?callbackUrl=/bookings?lessonType=quick-group-conversation');
      return;
    }
    setIsBooking(session.id);
    try {
        const productId = (session.title.toLowerCase().includes('quick') 
            ? 'quick-group-conversation' 
            : 'immersive-conversation-practice') as ProductId;

        const payload = {
            productId: productId,
            userId: user.uid,
            groupSessionId: session.id,
            date: format((session.startTime as any).toDate(), 'yyyy-MM-dd'),
            time: format((session.startTime as any).toDate(), 'HH:mm'),
        };
        const data = await createBooking(payload);
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        }
    } catch(error: any) {
        toast({ title: 'Booking Failed', description: error.message, variant: 'destructive'});
        setIsBooking(null);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground">No Upcoming Group Sessions</h3>
          <p className="text-muted-foreground mt-2">
            There are currently no scheduled group sessions. Please check back later or book an individual lesson.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => (
        <Card key={session.id} className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription>{session.description}</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/50 text-primary">${session.price}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-6">
                 <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary"/>
                    <span>{format(new Date(session.startTime as any), 'PPP')}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary"/>
                    <span>{format(new Date(session.startTime as any), 'p')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary"/>
                    <span>{session.participantCount} / {session.maxStudents} spots filled</span>
                </div>
            </div>
            <Button
              className="w-full"
              onClick={() => handleBookSession(session)}
              disabled={isBooking === session.id || session.participantCount >= session.maxStudents}
            >
              {isBooking === session.id ? (
                <><Spinner size="sm" className="mr-2"/>Processing...</>
              ) : session.participantCount >= session.maxStudents ? (
                'Session Full'
              ) : (
                'Book Your Spot'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
