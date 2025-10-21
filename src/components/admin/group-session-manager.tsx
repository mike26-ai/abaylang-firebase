
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, X, Users, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { createGroupSession, getGroupSessions, cancelGroupSession } from '@/services/groupSessionService';
import type { GroupSession } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Timestamp } from 'firebase/firestore';

const groupLessonTypes = [
    { value: 'quick-group-conversation', label: 'Quick Group Conversation', duration: 30, price: 7, description: 'A 30-minute session for practicing conversation with fellow learners.' },
    { value: 'immersive-conversation-practice', label: 'Immersive Conversation Practice', duration: 60, price: 12, description: 'A 60-minute session for deeper conversation and cultural insights.' }
];

export function GroupSessionManager() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [maxStudents, setMaxStudents] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionToCancel, setSessionToCancel] = useState<GroupSession | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { toast } = useToast();

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
        const fetchedSessions = await getGroupSessions();
        // Sort by start time, most recent first
        const sortedSessions = fetchedSessions.sort((a, b) => {
          const timeA = (a.startTime as unknown as Timestamp).toDate().getTime();
          const timeB = (b.startTime as unknown as Timestamp).toDate().getTime();
          return timeB - timeA;
        });
        setSessions(sortedSessions);
    } catch (error: any) {
        toast({ title: 'Error fetching sessions', description: error.message, variant: 'destructive' });
    } finally {
        setIsLoadingSessions(false);
    }
  };
  
  useEffect(() => {
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !user || !selectedType) {
      toast({ title: 'Missing Information', description: 'Please select a session type, date, and time.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
        const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
        
        await createGroupSession({
            sessionType: selectedType,
            startTime: startDateTime,
            maxStudents,
            tutorId: 'MahderNegashMamo', // Hardcoded for now
            tutorName: 'Mahder N. Mamo',
        });

      toast({ title: 'Success', description: 'Group session has been created.' });
      // Reset form
      setSelectedType('');
      setDate(undefined);
      setTime('');
      fetchSessions();
    } catch (error: any) {
      toast({ title: 'Error Creating Session', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = async () => {
    if (!sessionToCancel) return;
    setIsCancelling(true);
    try {
        await cancelGroupSession(sessionToCancel.id);
        toast({ title: 'Session Cancelled', description: `The session "${sessionToCancel.title}" has been cancelled.` });
        fetchSessions();
        setSessionToCancel(null);
    } catch(error: any) {
        toast({ title: 'Cancellation Failed', description: error.message, variant: 'destructive' });
    } finally {
        setIsCancelling(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              Create New Group Session
            </CardTitle>
            <CardDescription>Fill in the details for the new group class.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-1">
                <Label htmlFor="session-type">Session Type</Label>
                 <Select value={selectedType} onValueChange={setSelectedType} required>
                    <SelectTrigger id="session-type">
                        <SelectValue placeholder="Select a session type..." />
                    </SelectTrigger>
                    <SelectContent>
                        {groupLessonTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="date">Date</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input id="duration" type="number" value={groupLessonTypes.find(t => t.value === selectedType)?.duration || ''} readOnly disabled />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" value={groupLessonTypes.find(t => t.value === selectedType)?.price || ''} readOnly disabled />
                </div>
              </div>
               <div className="space-y-1">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input id="maxStudents" type="number" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} required />
                </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Spinner size="sm" className="mr-2" />}
                Create Session
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
         <Card className="shadow-xl">
           <CardHeader>
            <CardTitle>Upcoming Group Sessions</CardTitle>
            <CardDescription>A list of scheduled group classes and their status.</CardDescription>
          </CardHeader>
           <CardContent>
             {isLoadingSessions ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Spinner />
                </div>
             ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No upcoming group sessions have been created yet.</p>
                </div>
             ) : (
                <div className="space-y-4">
                    {sessions.map(session => (
                        <Card key={session.id} className="shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold text-foreground">{session.title}</h4>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4"/>
                                            {format((session.startTime as unknown as Timestamp).toDate(), 'PPP, p')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {session.participantCount || 0} / {session.maxStudents}
                                        </Badge>
                                        <Badge variant={session.status === 'scheduled' ? 'default' : 'destructive'}>{session.status}</Badge>
                                        <Button size="sm" variant="destructive" onClick={() => setSessionToCancel(session)} disabled={session.status === 'cancelled' || session.status === 'completed'}>
                                            <X className="w-4 h-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             )}
           </CardContent>
         </Card>
      </div>

       <AlertDialog open={!!sessionToCancel} onOpenChange={() => setSessionToCancel(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will cancel the session &quot;{sessionToCancel?.title}&quot;. This action cannot be undone and you will need to manually refund any registered students.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/80" onClick={handleCancelSession} disabled={isCancelling}>
                        {isCancelling && <Spinner size="sm" className="mr-2" />}
                        Confirm Cancellation
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
