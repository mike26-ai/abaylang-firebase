
"use client";

import { useEffect, useState } from "react";
import { collection, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldCheck, UserCheck, Mail, CalendarDays, BookOpen, User } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function StudentsManager() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("User not authenticated");

      const response = await fetch('/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch students from server.");
      }
      
      // Convert ISO string dates back to Date objects for formatting
      const fetchedStudents = result.data.map((student: any) => ({
          ...student,
          createdAt: parseISO(student.createdAt),
      }));

      setStudents(fetchedStudents);

    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({ title: "Error", description: error.message || "Could not fetch student data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to be ready before fetching
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchStudents();
      } else {
        setIsLoading(false); // If no user, stop loading
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleRoleChange = async (userId: string, newRole: "student" | "admin") => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { role: newRole });
      toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({ title: "Error", description: "Could not update user role.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (students.length === 0) {
    return <p className="text-muted-foreground">No students found.</p>;
  }

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Amharic Level</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.uid}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={student.photoURL || undefined} alt={student.name} data-ai-hint="user avatar" />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Badge variant={student.role === "admin" ? "destructive" : "secondary"}>
                    {student.role.charAt(0).toUpperCase() + student.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{student.amharicLevel?.replace(/-/g, " ").split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "N/A"}</Badge>
                </TableCell>
                <TableCell>{format(student.createdAt as any, 'PP')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                      <DropdownMenuItem disabled>
                        <Mail className="mr-2 h-4 w-4" /> Send Email (Soon)
                      </DropdownMenuItem>
                       <DropdownMenuItem disabled>
                        <CalendarDays className="mr-2 h-4 w-4" /> View Bookings (Soon)
                      </DropdownMenuItem>
                       <DropdownMenuItem disabled>
                        <BookOpen className="mr-2 h-4 w-4" /> View Progress (Soon)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                       <DropdownMenuItem 
                          onClick={() => handleRoleChange(student.uid, "admin")} 
                          disabled={student.role === 'admin'}
                          className={student.role === 'admin' ? "" : "cursor-pointer"}
                       >
                        <ShieldCheck className="mr-2 h-4 w-4 text-destructive" /> Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                          onClick={() => handleRoleChange(student.uid, "student")} 
                          disabled={student.role === 'student'}
                          className={student.role === 'student' ? "" : "cursor-pointer"}
                      >
                        <UserCheck className="mr-2 h-4 w-4 text-primary" /> Make Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {students.map((student) => (
          <Card key={student.uid} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.photoURL || undefined} alt={student.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled>
                      <Mail className="mr-2 h-4 w-4" /> Send Email (Soon)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleRoleChange(student.uid, "admin")} disabled={student.role === 'admin'}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-destructive" /> Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(student.uid, "student")} disabled={student.role === 'student'}>
                      <UserCheck className="mr-2 h-4 w-4 text-primary" /> Make Student
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Role:</span>
                <Badge variant={student.role === "admin" ? "destructive" : "secondary"}>{student.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Level:</span>
                <Badge variant="outline">{student.amharicLevel?.replace(/-/g, " ") || "N/A"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Joined:</span>
                <span>{format(student.createdAt as any, 'PP')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

    