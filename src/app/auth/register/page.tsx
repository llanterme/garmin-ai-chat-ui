import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account - Garmin AI Chat',
  description: 'Create your Garmin AI Chat account to start analyzing your fitness data',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}