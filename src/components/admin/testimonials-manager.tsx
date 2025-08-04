
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Testimonial } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, EyeOff, Trash2, Star } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/spinner";
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
} from "@/components/ui/alert-dialog";
// TODO: When implementing file uploads, import the server action.
// import { uploadImage } from "@/app/actions/uploadActions";

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
  }, []);

  const updateTestimonialStatus = async (testimonialId: string, status: Testimonial['status']) => {
    try {
      const testimonialDocRef = doc(db, "testimonials", testimonialId);
      await updateDoc(testimonialDocRef, { status });
      toast({ title: "Success", description: `Testimonial status updated to ${status}.` });
      fetchTestimonials(); // Refresh list
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
      fetchTestimonials(); // Refresh list
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({ title: "Error", description: "Could not delete testimonial.", variant: "destructive" });
    }
  };
  
  // TODO: Implement the file upload logic when a user submits a testimonial with an image.
  // const handleTestimonialImageUpload = async (file: File) => {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //
  //   const result = await uploadImage(formData);
  //
  //   if (result.success && result.url) {
  //     return result.url;
  //   } else {
  //     toast({ title: "Upload Failed", description: result.error, variant: "destructive" });
  //     return null;
  //   }
  // };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg"/></div>;
  }

  if (testimonials.length === 0) {
    return <p className="text-muted-foreground">No testimonials submitted yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
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
                >
                  {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{format(testimonial.createdAt.toDate(), 'PP pp')}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
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
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600 hover:!text-red-600 focus:!text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the testimonial by {testimonial.name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTestimonial(testimonial.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
