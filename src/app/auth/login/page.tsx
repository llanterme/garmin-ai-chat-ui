import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login - Garmin AI Chat',
  description: 'Sign in to your Garmin AI Chat account',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <LoginForm />
    </div>
  );
}