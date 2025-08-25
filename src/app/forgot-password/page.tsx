
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your ABYLANG account password.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthFormWrapper
      title="Forgot Your Password?"
      description="No problem. Enter your email address and we'll send you a link to reset it."
    >
      <ForgotPasswordForm />
    </AuthFormWrapper>
  );
}
