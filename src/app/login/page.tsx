

import { LoginForm } from "@/components/auth/login-form";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import type { Metadata } from 'next';
import { SiteLogo } from "@/components/layout/SiteLogo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
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
            title="Welcome Back!"
            description="Log in to continue your Amharic learning journey."
            >
                <LoginForm />
            </AuthFormWrapper>
        </div>
    </div>
  );
}
