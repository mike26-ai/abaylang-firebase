
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Check, X, Trash2, Users, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { createGroupSession, getGroupSessions } from '@/services/groupSessionService';
import type { GroupSession } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function GroupSessionManager() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [maxStudents, setMaxStudents] = useState(6);
  const [price, setPrice] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const { toast } = useToast();

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
        const fetchedSessions = await getGroupSessions();
        setSessions(fetchedSessions);
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
    if (!date || !time || !user) {
      toast({ title: 'Missing Information', description: 'Please select a date and time, and ensure you are logged in.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
        const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
        
        await createGroupSession({
            title,
            description,
            startTime: startDateTime,
            duration,
            maxStudents,
            price,
            tutorId: 'MahderNegashMamo', // Hardcoded for now
            tutorName: 'Mahder N. Mamo',
        });

      toast({ title: 'Success', description: 'Group session has been created.' });
      // Reset form
      setTitle('');
      setDescription('');
      setDate(undefined);
      setTime('');
      // Refetch sessions
      fetchSessions();
    } catch (error: any) {
      toast({ title: 'Error Creating Session', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
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
                <Label htmlFor="title">Session Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Intermediate Conversation" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Focus on travel phrases" required />
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input id="maxStudents" type="number" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} required />
                </div>
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
                                            {format(session.startTime.toDate(), 'PPP, p')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {session.participantCount || 0} / {session.maxStudents}
                                        </Badge>
                                        <Badge variant={session.status === 'scheduled' ? 'default' : 'destructive'}>{session.status}</Badge>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive" disabled={session.status === 'cancelled'}>
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will cancel the session &quot;{session.title}&quot;. This action cannot be undone and you will need to manually refund any registered students.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/80" onClick={() => {toast({title: "Coming Soon!", description: "Session cancellation logic is being implemented."})}}>Confirm Cancellation</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
    </div>
  );
}

