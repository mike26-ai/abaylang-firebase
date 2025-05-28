
import { LoginForm } from "@/components/auth/login-form";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <AuthFormWrapper
      title="Welcome Back!"
      description="Log in to continue your Amharic learning journey."
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
