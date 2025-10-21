
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Check, X, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
// This will require a new service function
// import { createGroupSession } from '@/services/groupSessionService';

export function GroupSessionManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [maxStudents, setMaxStudents] = useState(6);
  const [price, setPrice] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast({ title: 'Missing Information', description: 'Please select a date and time.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    toast({ title: 'Coming Soon!', description: 'This feature is being implemented.' });
    
    // Placeholder for actual submission logic
    console.log({
        title, description, date, time, duration, maxStudents, price
    });

    // try {
    //   await createGroupSession({ ... });
    //   toast({ title: 'Success', description: 'Group session created.' });
    // } catch (error: any) {
    //   toast({ title: 'Error', description: error.message, variant: 'destructive' });
    // } finally {
    //   setIsSubmitting(false);
    // }

    setTimeout(() => setIsSubmitting(false), 1500); // Simulate API call
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
             <div className="text-center py-12 text-muted-foreground">
               <p>The list of upcoming group sessions will be displayed here.</p>
                <p className="text-xs">(Feature in development)</p>
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
