
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Testimonial } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, EyeOff, Trash2, Star, User } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
import { Spinner } from "../ui/spinner";
=======
import { Spinner } from "@/components/ui/spinner";
>>>>>>> before-product-selection-rewrite
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
<<<<<<< HEAD
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
=======
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
>>>>>>> before-product-selection-rewrite

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteConfirmation, setDeleteConfirmation] = useState<Testimonial | null>(null);


  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const testimonialsCol = collection(db, "testimonials");
      const q = query(testimonialsCol, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedTestimonials = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(fetchedTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast({ title: "Error", description: "Could not fetch testimonials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTestimonialStatus = async (testimonialId: string, status: Testimonial['status']) => {
    try {
      const testimonialDocRef = doc(db, "testimonials", testimonialId);
      await updateDoc(testimonialDocRef, { status });
      toast({ title: "Success", description: `Testimonial status updated to ${status}.` });
      fetchTestimonials(); 
    } catch (error) {
      console.error("Error updating testimonial status:", error);
      toast({ title: "Error", description: "Could not update testimonial status.", variant: "destructive" });
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
     try {
      const testimonialDocRef = doc(db, "testimonials", testimonialId);
      await deleteDoc(testimonialDocRef);
      toast({ title: "Success", description: "Testimonial deleted." });
      setDeleteConfirmation(null);
      fetchTestimonials(); 
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({ title: "Error", description: "Could not delete testimonial.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg"/></div>;
  }

  if (testimonials.length === 0) {
    return <p className="text-muted-foreground">No testimonials submitted yet.</p>;
  }

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell className="font-medium">{testimonial.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {testimonial.rating} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{testimonial.comment}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      testimonial.status === "approved" ? "default" 
                      : testimonial.status === "pending" ? "secondary" 
                      : "destructive"
                    }
                    className={testimonial.status === 'pending' ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500" : ""}
                  >
                    {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{testimonial.createdAt ? format(testimonial.createdAt.toDate(), 'PP pp') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => updateTestimonialStatus(testimonial.id, "approved")} disabled={testimonial.status === 'approved'}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTestimonialStatus(testimonial.id, "pending")} disabled={testimonial.status === 'pending'}>
                          <EyeOff className="mr-2 h-4 w-4 text-orange-500" /> Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTestimonialStatus(testimonial.id, "rejected")} disabled={testimonial.status === 'rejected'}>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:!text-red-600 focus:!text-red-600" onClick={() => setDeleteConfirmation(testimonial)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
          {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="shadow-md">
                  <CardHeader>
                      <div className="flex justify-between items-start">
                          <div>
                              <CardTitle className="text-lg flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground"/> {testimonial.name}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">Submitted: {testimonial.createdAt ? format(testimonial.createdAt.toDate(), 'PP') : 'N/A'}</p>
                          </div>
                          <Badge 
                            variant={
                              testimonial.status === "approved" ? "default" 
                              : testimonial.status === "pending" ? "secondary" 
                              : "destructive"
                            }
                            className={testimonial.status === 'pending' ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500" : ""}
                          >
                            {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                          </Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                           <span className="text-sm font-bold ml-1">({testimonial.rating})</span>
                      </div>
<<<<<<< HEAD
                      <p className="text-muted-foreground text-sm italic">"{testimonial.comment}"</p>
=======
                      <p className="text-muted-foreground text-sm italic">&quot;{testimonial.comment}&quot;</p>
>>>>>>> before-product-selection-rewrite
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                       <div className="grid grid-cols-2 gap-2 w-full">
                           <Button onClick={() => updateTestimonialStatus(testimonial.id, "approved")} disabled={testimonial.status === 'approved'} size="sm">
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                           </Button>
                           <Button onClick={() => updateTestimonialStatus(testimonial.id, "rejected")} disabled={testimonial.status === 'rejected'} variant="outline" size="sm">
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                           </Button>
                       </div>
                       <Button onClick={() => setDeleteConfirmation(testimonial)} variant="destructive" size="sm" className="w-full mt-2">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                  </CardFooter>
              </Card>
          ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the testimonial by {deleteConfirmation?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmation && deleteTestimonial(deleteConfirmation.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
