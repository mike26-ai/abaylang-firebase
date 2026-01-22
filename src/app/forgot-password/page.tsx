
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import type { Metadata } from 'next';
import { SiteLogo } from "@/components/layout/SiteLogo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your ABYLANG account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Back to ABYLANG
                </Link>
                <div className="flex justify-center mb-4">
                    <SiteLogo />
                </div>
            </div>
            <AuthFormWrapper
            title="Forgot Your Password?"
            description="No problem. Enter your email address and we'll send you a link to reset it."
            >
                <ForgotPasswordForm />
            </AuthFormWrapper>
        </div>
    </div>
  );
}
