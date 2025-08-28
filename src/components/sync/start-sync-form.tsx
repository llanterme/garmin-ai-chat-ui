'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

import { useSync } from '@/hooks/use-sync';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const syncFormSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      const daysDiff = Math.ceil(
        (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 365; // Limit to 1 year max
    },
    {
      message: 'Date range cannot exceed 365 days',
      path: ['endDate'],
    }
  );

type SyncFormData = z.infer<typeof syncFormSchema>;

interface StartSyncFormProps {
  onSyncStarted?: (jobId: string) => void;
}

export function StartSyncForm({ onSyncStarted }: StartSyncFormProps) {
  const { garminCredentials } = useAuth();
  const { startSync, isStartingSyncLoading, startSyncResult, startSyncError } = useSync();

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SyncFormData>({
    resolver: zodResolver(syncFormSchema),
    defaultValues: {
      startDate: startOfDay(subDays(new Date(), 30)), // Default to last 30 days
      endDate: endOfDay(new Date()),
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = async (data: SyncFormData) => {
    startSync({
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
    });
  };

  // Quick date presets
  const setDatePreset = (days: number) => {
    setValue('startDate', startOfDay(subDays(new Date(), days)));
    setValue('endDate', endOfDay(new Date()));
  };

  const calculateEstimatedActivities = () => {
    if (!startDate || !endDate) return 0;
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Rough estimate: 0.5 activities per day on average
    return Math.round(daysDiff * 0.5);
  };

  const hasGarminCredentials = garminCredentials?.hasCredentials;

  if (!hasGarminCredentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Garmin Account Required
          </CardTitle>
          <CardDescription>
            You need to connect your Garmin Connect account before you can sync activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/settings/garmin">Connect Garmin Account</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Start Activity Sync
        </CardTitle>
        <CardDescription>
          Select the date range for activities you want to sync from Garmin Connect.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Presets */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Date Ranges</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDatePreset(7)}
              >
                Last 7 days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDatePreset(30)}
              >
                Last 30 days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDatePreset(90)}
              >
                Last 3 months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDatePreset(365)}
              >
                Last year
              </Button>
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => date && setValue('startDate', date)}
              disabled={isStartingSyncLoading}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => date && setValue('endDate', date)}
              disabled={isStartingSyncLoading}
            />
          </div>

          {/* Validation Errors */}
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}

          {/* Estimated Activities */}
          {startDate && endDate && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Estimated {calculateEstimatedActivities()} activities to sync
                </span>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {startSyncResult?.success && startSyncResult.data && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Sync started successfully!
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Sync ID: {startSyncResult.data.sync_id}
              </p>
            </div>
          )}

          {startSyncError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Failed to start sync
                </p>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {startSyncError.message || 'An error occurred'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isStartingSyncLoading || !startDate || !endDate}
          >
            {isStartingSyncLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Sync...
              </>
            ) : (
              'Start Sync'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}