
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock, Ticket, AlertTriangle, Loader2 } from 'lucide-react';
import { getGroupSessions } from '@/services/groupSessionService';
import type { GroupSession } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function UpcomingGroupSessions() {
    const [sessions, setSessions] = useState<GroupSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const upcomingSessions = await getGroupSessions();
                setSessions(upcomingSessions);
            } catch (error: any) {
                toast({
                    title: "Failed to load sessions",
                    description: error.message || "Could not retrieve upcoming group sessions.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, [toast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
             <Card className="shadow-lg border-dashed">
                <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground">No Upcoming Sessions</h3>
                    <p className="text-muted-foreground mt-2">
                        There are no public group sessions scheduled at the moment. Please check back soon!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {sessions.map((session) => {
                const isFull = session.participantCount >= session.maxStudents;
                return (
                <Card key={session.id} className={`shadow-lg ${isFull ? 'opacity-60' : ''}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">{session.title}</CardTitle>
                                <CardDescription>{session.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">${session.price}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(session.startTime as any), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(session.startTime as any), 'p')} ({session.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{session.participantCount} / {session.maxStudents} students</span>
                        </div>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" asChild disabled={isFull}>
                            <Link href={`/bookings?lessonType=${session.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                {isFull ? 'Session Full' : 'Book Your Spot'}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                )
            })}
        </div>
    );
}

    