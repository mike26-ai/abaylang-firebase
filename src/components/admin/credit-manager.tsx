
"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import type { UserProfile, UserCredit } from "@/lib/types";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, User } from "lucide-react";

interface UserWithCredits extends UserProfile {
    credits: UserCredit[];
}

export function CreditManager() {
  const [usersWithCredits, setUsersWithCredits] = useState<UserWithCredits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsersWithCredits = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, "users");
      // This query gets all users that have a 'credits' field which is an array and not empty
      const q = query(usersRef, where("credits", "!=", []));
      const querySnapshot = await getDocs(q);
      
      const fetchedUsers: UserWithCredits[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        if (userData.credits && userData.credits.length > 0) {
            fetchedUsers.push({ ...userData, id: doc.id } as UserWithCredits);
        }
      });
      setUsersWithCredits(fetchedUsers);

    } catch (error: any) {
      console.error("Error fetching users with credits:", error);
      toast({ title: "Error", description: "Could not fetch user credit data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithCredits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const modifyCredits = async (userId: string, lessonType: string, change: number) => {
    const userRef = doc(db, "users", userId);
    try {
        const userToUpdate = usersWithCredits.find(u => u.uid === userId);
        if (!userToUpdate) return;

        const creditToUpdate = userToUpdate.credits.find(c => c.lessonType === lessonType);
        
        if (creditToUpdate) {
            const newCount = creditToUpdate.count + change;
            if (newCount < 0) {
                toast({ title: "Invalid Operation", description: "Cannot have negative credits.", variant: "destructive" });
                return;
            }
            
            // Create a new credits array with the updated value
            const newCredits = userToUpdate.credits.map(c => 
                c.lessonType === lessonType ? { ...c, count: newCount } : c
            );

            await updateDoc(userRef, { credits: newCredits });
            
            toast({ title: "Success", description: `Credits updated for ${userToUpdate.name}.` });
            fetchUsersWithCredits(); // Refresh data
        }

    } catch (error) {
        console.error("Error modifying credits:", error);
        toast({ title: "Error", description: "Failed to update credits.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (usersWithCredits.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No users have purchased credit packages yet.</p>;
  }

  return (
    <div className="space-y-6">
      {usersWithCredits.map((user) => (
        <Card key={user.uid} className="shadow-lg">
          <CardHeader>
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Type</TableHead>
                  <TableHead>Remaining Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
