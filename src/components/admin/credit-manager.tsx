

"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import type { UserProfile, UserCredit } from "@/lib/types";
import { collection, query, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface UserWithCredits extends UserProfile {
    credits: UserCredit[];
}

const lessonCreditTypes = [
    { value: 'quick-practice-bundle', label: 'Quick Practice (30 min)' },
    { value: 'learning-intensive', label: 'Learning Intensive (60 min)' },
    { value: 'starter-bundle', label: 'Starter Bundle (30 min)' },
    { value: 'foundation-pack', label: 'Foundation Pack (60 min)' },
];

export function CreditManager() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [grantCreditDialogOpen, setGrantCreditDialogOpen] = useState(false);
  const [selectedUserForGrant, setSelectedUserForGrant] = useState<UserProfile | null>(null);
  const [creditTypeToGrant, setCreditTypeToGrant] = useState('');
  const [isGranting, setIsGranting] = useState(false);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication token not found.");

      const response = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch users from server.");
      }

      setAllUsers(result.data.sort((a: UserProfile, b: UserProfile) => (a.name || '').localeCompare(b.name || '')));

    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: error.message || "Could not fetch user data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchAllUsers();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const modifyCredits = async (userId: string, lessonType: string, change: number) => {
    const userRef = doc(db, "users", userId);
    try {
        const userToUpdate = allUsers.find(u => u.uid === userId);
        if (!userToUpdate) return;

        const currentCredits = userToUpdate.credits || [];
        const creditToUpdate = currentCredits.find(c => c.lessonType === lessonType);
        
        let newCredits: UserCredit[];

        if (creditToUpdate) {
            const newCount = creditToUpdate.count + change;
            if (newCount < 0) {
                toast({ title: "Invalid Operation", description: "Cannot have negative credits.", variant: "destructive" });
                return;
            }
             newCredits = currentCredits.map(c => 
                c.lessonType === lessonType ? { ...c, count: newCount } : c
            ).filter(c => c.count > 0); // Remove credit type if count is 0
        } else if (change > 0) {
            newCredits = [...currentCredits, { lessonType, count: change, purchasedAt: new Date() as any }];
        } else {
            // Trying to decrement a credit that doesn't exist
            toast({ title: "Invalid Operation", description: "User does not have this credit type.", variant: "destructive" });
            return;
        }

        await updateDoc(userRef, { credits: newCredits });
        
        toast({ title: "Success", description: `Credits updated for ${userToUpdate.name}.` });
        fetchAllUsers();
    } catch (error) {
        console.error("Error modifying credits:", error);
        toast({ title: "Error", description: "Failed to update credits.", variant: "destructive" });
    }
  };

  const handleGrantCredit = async () => {
    if (!selectedUserForGrant || !creditTypeToGrant) return;

    setIsGranting(true);
    await modifyCredits(selectedUserForGrant.uid, creditTypeToGrant, 1);
    setIsGranting(false);
    setGrantCreditDialogOpen(false);
    setSelectedUserForGrant(null);
    setCreditTypeToGrant('');
  }

  const openGrantDialog = (user: UserProfile) => {
    setSelectedUserForGrant(user);
    setGrantCreditDialogOpen(true);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (allUsers.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No users found.</p>;
  }

  return (
    <div className="space-y-6">
      {allUsers.map((user) => (
        <Card key={user.uid} className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL || ''} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openGrantDialog(user)}>
                    <Gift className="h-4 w-4 mr-2"/>
                    Grant Credit
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {user.credits && user.credits.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Package Type</TableHead>
                    <TableHead>Remaining Credits</TableHead>
                    <TableHead className="text-right">Manual Adjustment</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {user.credits.map((credit, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{credit.lessonType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                        <TableCell>{credit.count}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => modifyCredits(user.uid, credit.lessonType, 1)}>
                            <PlusCircle className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => modifyCredits(user.uid, credit.lessonType, -1)} disabled={credit.count <= 0}>
                            <MinusCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">This user has no active credit packages.</p>
            )}
          </CardContent>
        </Card>
      ))}

        <Dialog open={grantCreditDialogOpen} onOpenChange={setGrantCreditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Grant a Lesson Credit</DialogTitle>
                    <DialogDescription>
                        Select a lesson type to grant a single credit to {selectedUserForGrant?.name}. This is useful for resolving customer service issues or rewarding students.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-1">
                        <Label>Student</Label>
                        <Input value={selectedUserForGrant?.name} disabled />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="credit-type">Lesson Credit Type</Label>
                        <Select value={creditTypeToGrant} onValueChange={setCreditTypeToGrant}>
                            <SelectTrigger id="credit-type">
                                <SelectValue placeholder="Select a credit type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {lessonCreditTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setGrantCreditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleGrantCredit} disabled={isGranting || !creditTypeToGrant}>
                        {isGranting && <Spinner size="sm" className="mr-2" />}
                        Confirm and Grant Credit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
