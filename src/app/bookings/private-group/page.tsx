
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { products } from '@/config/products';
import { createBooking } from '@/services/bookingService';

interface Member {
  name: string;
  email: string;
}

export default function PrivateGroupBookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<Member[]>([{ name: '', email: '' }]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const privateGroupProduct = products['private-group-lesson'];

  const addMember = () => {
    if (members.length < 5) { // Leader + 5 members = 6 total
      setMembers([...members, { name: '', email: '' }]);
    } else {
      toast({ title: 'Maximum Group Size', description: 'A private group can have a maximum of 6 participants.', variant: 'destructive' });
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleNextStep = () => {
    const allMembersValid = members.every(m => m.name.trim() !== '' && m.email.trim() !== '' && m.email.includes('@'));
    if (!allMembersValid) {
      toast({ title: 'Incomplete Information', description: 'Please fill out the name and a valid email for all members.', variant: 'destructive' });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
     if (!user) {
        toast({ title: "Login Required", variant: "destructive" });
        router.push('/login?callbackUrl=/bookings/private-group');
        return;
    }
    if (!date || !time) {
        toast({ title: "Date and Time Required", variant: "destructive" });
        return;
    }
    setIsLoading(true);

    try {
        const response = await fetch('/api/bookings/create-private-group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await user.getIdToken()}`,
            },
            body: JSON.stringify({
                date,
                time,
                duration: privateGroupProduct.duration,
                lessonType: privateGroupProduct.label,
                pricePerStudent: privateGroupProduct.price,
                tutorId: 'MahderNegashMamo',
                leader: { name: user.displayName, email: user.email },
                members,
            }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create group session.');
        
        toast({ title: "Group Session Created!", description: "Proceed to payment to confirm your group's spot." });
        
        const bookingId = result.bookingId;
        const passthroughData = { booking_id: bookingId, product_id: 'private-group-lesson' };
        const checkoutUrl = `https://sandbox-billing.paddle.com/checkout/buy/${privateGroupProduct.paddlePriceId}?email=${encodeURIComponent(user.email || "")}&passthrough=${encodeURIComponent(JSON.stringify(passthroughData))}`;
        window.location.href = checkoutUrl;

    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto max-w-2xl py-12">
        <div className="mb-8">
            <Button variant="ghost" asChild>
                <Link href="/packages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Packages</Link>
            </Button>
        </div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><Users className="w-6 h-6 text-primary"/>Book a Private Group Lesson</CardTitle>
          <CardDescription>Organize a session for just you and your friends or family. Minimum 3 people total, maximum 6.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">Step 1: Invite Your Group Members</h3>
                <p className="text-sm text-muted-foreground">Add at least 2 other people to meet the minimum group size of 3.</p>
              </div>

              <div className="p-4 bg-accent/50 rounded-lg border">
                <Label>Group Leader (You)</Label>
                <p className="font-semibold text-primary">{user?.displayName || 'Please Log In'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {members.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                  <Label>Member {index + 1}</Label>
                   {members.length > 1 && (
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeMember(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="Full Name" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                    <Input type="email" placeholder="Email Address" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addMember} disabled={members.length >= 5}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Another Member
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg">Step 2: Choose a Date & Time</h3>
                    <p className="text-sm text-muted-foreground">Select a 60-minute time slot for your group lesson.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                </div>
                 <div className="p-4 bg-accent/50 rounded-lg border text-center">
                    <p className="font-semibold">Total Cost: ${privateGroupProduct.price} x {members.length + 1} participants = <span className="text-primary text-xl">${privateGroupProduct.price * (members.length + 1)}</span></p>
                    <p className="text-sm text-muted-foreground">The group leader pays for the entire session. You can arrange reimbursement with your group members personally.</p>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>Back</Button>
            {step === 1 && <Button onClick={handleNextStep}>Choose Time</Button>}
            {step === 2 && <Button onClick={handleSubmit} disabled={isLoading}>{isLoading && <Spinner size="sm" className="mr-2"/>}Proceed to Payment</Button>}
        </CardFooter>
      </Card>
    </div>
  );
}
