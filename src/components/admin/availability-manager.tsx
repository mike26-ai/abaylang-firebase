
"use client";

import { useState, useEffect }d from "react";
import {
  collection,
  query,
  where,
  Timestamp,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { BlockedSlot } from "@/lib/types";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";

export function AvailabilityManager() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  useEffect(() => {
    if (selectedDate && isAdmin) {
      fetchBlockedSlots(selectedDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isAdmin]);

  const fetchBlockedSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      const start = startOfDay(date);
      const end = endOfDay(date);

      const q = query(
        collection(db, "blockedSlots"),
        where("startTime", ">=", Timestamp.fromDate(start)),
        where("startTime", "<=", Timestamp.fromDate(end)),
        orderBy("startTime", "asc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedSlots = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as BlockedSlot));

      setBlockedSlots(fetchedSlots);
    } catch (error) {
      console.error("Error fetching blocked slots:", error);
      toast({
        title: "Error",
        description: "Could not fetch blocked slots.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlockedSlot = async () => {
    if (!user || !selectedDate || !startTime || !endTime) {
      toast({ title: "Missing Information", description: "Please select a date and time range.", variant: "destructive" });
      return;
    }

    const startDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${startTime}:00`);
    const endDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      toast({ title: "Invalid Time", description: "End time must be after start time.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "blockedSlots"), {
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        reason: "Admin block",
      });
      toast({ title: "Success", description: "Time slot has been blocked." });
      fetchBlockedSlots(selectedDate); // Refresh list
    } catch (error) {
      console.error("Error adding blocked slot:", error);
      toast({ title: "Error", description: "Could not block the time slot.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteSlot = async (slotId: string) => {
    try {
        await deleteDoc(doc(db, "blockedSlots", slotId));
        toast({ title: "Slot Unblocked", description: "The time slot is now available." });
        if (selectedDate) {
            fetchBlockedSlots(selectedDate); // Refresh the list
        }
    } catch (error) {
        console.error("Error deleting blocked slot:", error);
        toast({ title: "Error", description: "Could not unblock the slot.", variant: "destructive" });
    }
  };


  if (!isAdmin) {
    return <p className="text-destructive">You do not have permission to view this page.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium mb-4 text-center">1. Select a Date</h3>
        <div className="flex justify-center">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
            />
        </div>
        <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">2. Add a New Block</h3>
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>
                 <Button onClick={handleAddBlockedSlot} disabled={isSaving} className="w-full">
                    {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
                    Block Time Range
                </Button>
            </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Blocked Slots for {selectedDate ? format(selectedDate, "PPP") : "..."}</CardTitle>
          <CardDescription>These time slots will be unavailable for booking.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Spinner /></div>
          ) : blockedSlots.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No slots blocked for this day.</p>
          ) : (
            <ul className="space-y-3">
              {blockedSlots.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="font-medium">
                    {format(slot.startTime.toDate(), "p")} - {format(slot.endTime.toDate(), "p")}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => slot.id && handleDeleteSlot(slot.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
