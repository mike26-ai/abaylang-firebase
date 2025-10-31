
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const memberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

const privateGroupBookingSchema = z.object({
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().min(1, 'Please select a time.'),
  members: z.array(memberSchema).min(1, 'Add at least one member.').max(5, 'You can add up to 5 other members.'),
});

export type PrivateGroupBookingFormValues = z.infer<typeof privateGroupBookingSchema>;

export const useGroupBookingForm = (product: any) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PrivateGroupBookingFormValues>({
    resolver: zodResolver(privateGroupBookingSchema),
    defaultValues: {
      date: undefined,
      time: undefined,
      members: [{ name: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  const onSubmit = async (values: PrivateGroupBookingFormValues) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to create a private group session.", variant: "destructive" });
      router.push("/login?redirect=/bookings?lessonType=private-group-lesson");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      
      const payload = {
          date: format(values.date, 'yyyy-MM-dd'),
          time: values.time,
          duration: product.duration,
          lessonType: product.label,
          pricePerStudent: product.price,
          tutorId: 'MahderNegashMamo',
          leader: {
              name: user.displayName,
              email: user.email,
          },
          members: values.members,
      };

      const response = await fetch('/api/bookings/create-private-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create private group booking.');
      }
      
      toast({
        title: 'Group Session Created!',
        description: 'Your private group lesson has been initiated. Each member will need to complete their payment.',
      });
      router.push(`/bookings/success?booking_id=${result.bookingId}&type=private-group`);

    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, fields, append, remove, isSubmitting, onSubmit };
};
