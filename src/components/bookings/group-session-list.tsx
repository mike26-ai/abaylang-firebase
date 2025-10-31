
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { GroupSession } from '@/lib/types';
import { getGroupSessions } from '@/services/groupSessionService';
import { createBooking } from '@/services/bookingService';
import { products, type ProductId } from '@/config/products';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { Users, Calendar, Clock, Tag, UserCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

export function GroupSessionList() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const upcomingSessions = await getGroupSessions();
        setSessions(upcomingSessions);
      } catch (error: any) {
        toast({ title: 'Error', description: 'Could not fetch group sessions.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [toast]);

  const handleBookGroupSession = async (session: GroupSession) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to book a session.', variant: 'destructive' });
      router.push('/login?callbackUrl=/bookings');
      return;
    }
    
    setIsBooking(session.id);
    
    // Find the corresponding product ID from the session title
    const productKey = Object.keys(products).find(key => products[key as ProductId].label === session.title) as ProductId | undefined;

    if (!productKey) {
        toast({ title: 'Error', description: 'Cannot find product information for this session.', variant: 'destructive' });
        setIsBooking(null);
        return;
    }

    try {
        const payload = {
            productId: productKey,
            userId: user.uid,
            groupSessionId: session.id,
        };
        const data = await createBooking(payload);
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        }
    } catch (error: any) {
        toast({ title: 'Booking Failed', description: error.message || 'Could not book this session.', variant: 'destructive' });
        setIsBooking(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8"><Spinner /></div>;
  }
  
  if (sessions.length === 0) {
    return null; // Don't render the card if there are no sessions
  }

  return (
    <Card className="shadow-xl mb-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <Users className="w-5 h-5 text-primary" />
          Join an Upcoming Group Session
        </CardTitle>
        <CardDescription>Practice with other learners in a scheduled group class. Spots are limited!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map(session => {
           const isFull = session.participantCount >= session.maxStudents;
           const isRegistered = user ? session.participantIds.includes(user.uid) : false;
           return (
            <div key={session.id} className="p-4 border rounded-lg bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground">{session.title}</h4>
                <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{format(new Date(session.startTime), 'PPP')}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/>{format(new Date(session.startTime), 'p')}</span>
                    <span className="flex items-center gap-1.5"><Tag className="w-4 h-4"/>${session.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                 <Badge variant="outline" className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {session.participantCount} / {session.maxStudents} Spots
                 </Badge>
                
                 {isRegistered ? (
                    <Button size="sm" disabled>
                        <UserCheck className="w-4 h-4 mr-2"/> Registered
                    </Button>
                 ) : isFull ? (
                     <Button size="sm" disabled variant="secondary">
                        <AlertTriangle className="w-4 h-4 mr-2"/> Full
                    </Button>
                 ) : (
                    <Button size="sm" onClick={() => handleBookGroupSession(session)} disabled={isBooking === session.id}>
                        {isBooking === session.id ? <Spinner size="sm" className="mr-2"/> : null}
                        Book a Spot
                    </Button>
                 )}
              </div>
            </div>
           )
        })}
      </CardContent>
    </Card>
  );
}
