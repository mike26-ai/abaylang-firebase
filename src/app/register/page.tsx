
import { RegisterForm } from "@/components/auth/register-form";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function RegisterPage() {
  return (
    <AuthFormWrapper
      title="Create Your Account"
      description="Join Amharic Connect and start your language learning experience."
    >
      <RegisterForm />
    </AuthFormWrapper>
  );
}
