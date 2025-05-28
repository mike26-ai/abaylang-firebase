
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactMessage } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/spinner";
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

export function InquiriesViewer() {
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const inquiriesCol = collection(db, "contactMessages");
      const q = query(inquiriesCol, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedInquiries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
      setInquiries(fetchedInquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({ title: "Error", description: "Could not fetch contact inquiries.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const markAsRead = async (inquiryId: string) => {
    try {
      const inquiryDocRef = doc(db, "contactMessages", inquiryId);
      await updateDoc(inquiryDocRef, { read: true });
      // No toast for this to avoid clutter, list will update
      fetchInquiries(); 
    } catch (error) {
      console.error("Error marking as read:", error);
      toast({ title: "Error", description: "Could not mark inquiry as read.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg"/></div>;
  }

  if (inquiries.length === 0) {
    return <p className="text-muted-foreground">No contact inquiries found.</p>;
  }

  return (
    <div className="overflow-x-auto">
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
              <TableCell>{format(inquiry.createdAt.toDate(), 'PP pp')}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => {setSelectedInquiry(inquiry); if(!inquiry.read) markAsRead(inquiry.id)}}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={(isOpen) => !isOpen && setSelectedInquiry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Inquiry from: {selectedInquiry.name}</DialogTitle>
              <DialogDescription>Email: {selectedInquiry.email} | Received: {format(selectedInquiry.createdAt.toDate(), 'PPP p')}</DialogDescription>
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
    </div>
  );
}
