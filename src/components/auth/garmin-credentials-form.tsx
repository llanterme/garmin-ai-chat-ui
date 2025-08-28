'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Shield, AlertTriangle } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const garminCredentialsSchema = z.object({
  email: z.string().email('Please enter a valid Garmin Connect email'),
  password: z.string().min(1, 'Password is required'),
});

type GarminCredentialsFormData = z.infer<typeof garminCredentialsSchema>;

interface GarminCredentialsFormProps {
  isUpdate?: boolean;
  onSuccess?: () => void;
}

export function GarminCredentialsForm({
  isUpdate = false,
  onSuccess,
}: GarminCredentialsFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    setGarminCredentials,
    updateGarminCredentials,
    isGarminLoading,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GarminCredentialsFormData>({
    resolver: zodResolver(garminCredentialsSchema),
  });

  const onSubmit = async (data: GarminCredentialsFormData) => {
    try {
      if (isUpdate) {
        updateGarminCredentials(data);
      } else {
        setGarminCredentials(data);
      }
      reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is managed by the auth hook
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold text-center">
          {isUpdate ? 'Update' : 'Connect'} Garmin Account
        </CardTitle>
        <CardDescription className="text-center text-sm">
          {isUpdate
            ? 'Update your Garmin Connect credentials'
            : 'Connect your Garmin Connect account to sync your activities'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Your credentials are secure
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your Garmin credentials are encrypted and stored securely. We
                only use them to sync your activity data.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="garmin-email">Garmin Connect Email</Label>
            <Input
              id="garmin-email"
              type="email"
              placeholder="your-garmin-email@example.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="garmin-password">Garmin Connect Password</Label>
            <div className="relative">
              <Input
                id="garmin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your Garmin Connect password"
                {...register('password')}
                className={
                  errors.password ? 'border-destructive pr-10' : 'pr-10'
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Make sure you can log into Garmin Connect with these credentials
                before saving them here.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isGarminLoading}>
            {isGarminLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? 'Updating...' : 'Connecting...'}
              </>
            ) : (
              <>{isUpdate ? 'Update Credentials' : 'Connect Account'}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}