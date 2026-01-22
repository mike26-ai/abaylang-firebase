
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc } from "firebase/firestore";
<<<<<<< HEAD
import { db } from "@/lib/firebase";
=======
import { auth, db } from "@/lib/firebase";
>>>>>>> before-product-selection-rewrite
import type { ContactMessage } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, User, Clock } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
import { Spinner } from "../ui/spinner";
=======
import { Spinner } from "@/components/ui/spinner";
>>>>>>> before-product-selection-rewrite
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
=======
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
>>>>>>> before-product-selection-rewrite

export function InquiriesViewer() {
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      const inquiriesCol = collection(db, "contactMessages");
      const q = query(inquiriesCol, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedInquiries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
      setInquiries(fetchedInquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({ title: "Error", description: "Could not fetch contact inquiries.", variant: "destructive" });
=======
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("User not authenticated");

      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch inquiries.");
      }
      
       const fetchedInquiries = result.data.map((inquiry: any) => ({
        ...inquiry,
        // Convert ISO strings back to Date objects for formatting
        createdAt: inquiry.createdAt ? new Date(inquiry.createdAt) : new Date(),
      }));

      setInquiries(fetchedInquiries);
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      toast({ title: "Error", description: error.message || "Could not fetch contact inquiries.", variant: "destructive" });
>>>>>>> before-product-selection-rewrite
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  useEffect(() => {
    fetchInquiries();
=======
   useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchInquiries();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
>>>>>>> before-product-selection-rewrite
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (inquiryId: string) => {
    try {
      const inquiryDocRef = doc(db, "contactMessages", inquiryId);
      await updateDoc(inquiryDocRef, { read: true });
<<<<<<< HEAD
      fetchInquiries(); 
=======
      // The API fetches all, so a client-side update is sufficient for immediate UI feedback
      setInquiries(prev => prev.map(inq => inq.id === inquiryId ? {...inq, read: true} : inq));
>>>>>>> before-product-selection-rewrite
    } catch (error) {
      console.error("Error marking as read:", error);
      toast({ title: "Error", description: "Could not mark inquiry as read.", variant: "destructive" });
    }
  };

  const openInquiryDialog = (inquiry: ContactMessage) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.read) {
      markAsRead(inquiry.id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg"/></div>;
  }

  if (inquiries.length === 0) {
    return <p className="text-muted-foreground">No contact inquiries found.</p>;
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
              <TableHead>Message (Preview)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id} className={!inquiry.read ? "font-semibold bg-accent/50" : ""}>
                <TableCell>{inquiry.name}</TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell className="max-w-sm truncate">{inquiry.message}</TableCell>
                <TableCell>
                  <Badge variant={inquiry.read ? "secondary" : "default"}>
                    {inquiry.read ? "Read" : "Unread"}
                  </Badge>
                </TableCell>
<<<<<<< HEAD
                <TableCell>{inquiry.createdAt ? format(inquiry.createdAt.toDate(), 'PP pp') : 'N/A'}</TableCell>
=======
                <TableCell>{inquiry.createdAt ? format(inquiry.createdAt as any, 'PP pp') : 'N/A'}</TableCell>
>>>>>>> before-product-selection-rewrite
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openInquiryDialog(inquiry)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className={`shadow-md ${!inquiry.read ? "border-primary/50" : ""}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                </div>
                <Badge variant={inquiry.read ? "secondary" : "default"}>
                  {inquiry.read ? "Read" : "Unread"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
<<<<<<< HEAD
              <p className="text-muted-foreground line-clamp-3">"{inquiry.message}"</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Clock className="w-3 h-3" />
                <span>Received: {inquiry.createdAt ? format(inquiry.createdAt.toDate(), 'PP') : 'N/A'}</span>
=======
              <p className="text-muted-foreground line-clamp-3">&quot;{inquiry.message}&quot;</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Clock className="w-3 h-3" />
                <span>Received: {inquiry.createdAt ? format(inquiry.createdAt as any, 'PP') : 'N/A'}</span>
>>>>>>> before-product-selection-rewrite
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openInquiryDialog(inquiry)}>
                    <Eye className="mr-2 h-4 w-4" /> View Full Message
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>


      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={(isOpen) => !isOpen && setSelectedInquiry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Inquiry from: {selectedInquiry.name}</DialogTitle>
<<<<<<< HEAD
              <DialogDescription>Email: {selectedInquiry.email} | Received: {selectedInquiry.createdAt ? format(selectedInquiry.createdAt.toDate(), 'PPP p') : 'N/A'}</DialogDescription>
=======
              <DialogDescription>Email: {selectedInquiry.email} | Received: {selectedInquiry.createdAt ? format(selectedInquiry.createdAt as any, 'PPP p') : 'N/A'}</DialogDescription>
>>>>>>> before-product-selection-rewrite
            </DialogHeader>
            <div className="py-4 prose prose-sm max-w-none whitespace-pre-wrap break-words">
              {selectedInquiry.message}
            </div>
            <DialogFooter className="sm:justify-start">
              <Button asChild variant="outline">
                <a href={`mailto:${selectedInquiry.email}?subject=Re: Inquiry from ${selectedInquiry.name}`}>
                  <Mail className="mr-2 h-4 w-4" /> Reply via Email
                </a>
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
