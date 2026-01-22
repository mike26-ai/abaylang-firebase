
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsEmailSent(true);
      toast({
        title: "Check Your Email",
        description: `A password reset link has been sent to ${values.email}.`,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
<<<<<<< HEAD
      const errorMessage = "An error occurred. Please try again.";
=======
      let errorMessage = "An error occurred. Please try again.";
>>>>>>> before-product-selection-rewrite
      if (error.code === 'auth/user-not-found') {
        // For security, we don't reveal if the user exists, but we show the same success message.
        // This prevents email enumeration attacks.
        setIsEmailSent(true); 
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isEmailSent) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold">Email Sent</h3>
        <p className="text-muted-foreground mt-2">
          If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          Send Reset Link
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Remembered your password? Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
