'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Loader2, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';

import { useSync } from '@/hooks/use-sync';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskProgress } from './task-progress';

const syncFormSchema = z
  .object({
    syncMode: z.enum(['days', 'range']),
    days: z.number().min(1).max(365).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    force_resync: z.boolean(),
    force_reingest: z.boolean(),
    batch_size: z.number().min(1).max(50),
  })
  .refine((data) => {
    if (data.syncMode === 'days') {
      return data.days !== undefined && data.days >= 1 && data.days <= 365;
    }
    return data.startDate !== undefined && data.endDate !== undefined;
  }, {
    message: 'Please provide either days or date range',
  })
  .refine((data) => {
    if (data.syncMode === 'range' && data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  }, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  })
  .refine((data) => {
    if (data.syncMode === 'range' && data.startDate && data.endDate) {
      const daysDiff = Math.ceil(
        (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 365;
    }
    return true;
  }, {
    message: 'Date range cannot exceed 365 days',
    path: ['endDate'],
  });

type SyncFormData = z.infer<typeof syncFormSchema>;

interface StartSyncFormProps {
  onSyncStarted?: (jobId: string) => void;
}

export function StartSyncForm({ onSyncStarted }: StartSyncFormProps) {
  const { user, garminCredentials } = useAuth();
  const { startSync, isStartingSyncLoading, startSyncResult, startSyncError } = useSync();
  const [syncMode, setSyncMode] = useState<'days' | 'range'>('days');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SyncFormData>({
    resolver: zodResolver(syncFormSchema),
    defaultValues: {
      syncMode: 'days',
      days: 30,
      startDate: startOfDay(subDays(new Date(), 30)),
      endDate: endOfDay(new Date()),
      force_resync: false,
      force_reingest: false,
      batch_size: 10,
    },
  });

  const watchedSyncMode = watch('syncMode');
  const days = watch('days');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const forceResync = watch('force_resync');
  const forceReingest = watch('force_reingest');
  const batchSize = watch('batch_size');

  const onSubmit = async (data: SyncFormData) => {
    const request: any = {
      force_resync: data.force_resync,
      force_reingest: data.force_reingest,
      batch_size: data.batch_size,
    };
    
    if (data.syncMode === 'days') {
      request.days = data.days;
    } else {
      request.start_date = data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined;
      request.end_date = data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined;
    }
    
    startSync(request);
  };

  // Watch for successful sync start to show progress
  useEffect(() => {
    if (startSyncResult?.success && startSyncResult.data?.task_id) {
      setActiveTaskId(startSyncResult.data.task_id);
      if (onSyncStarted) {
        onSyncStarted(startSyncResult.data.task_id);
      }
    }
  }, [startSyncResult, onSyncStarted]);

  // Quick date presets
  const setDaysPreset = (daysCount: number) => {
    setValue('syncMode', 'days');
    setValue('days', daysCount);
    setSyncMode('days');
  };
  
  const setDateRangePreset = (daysBack: number) => {
    setValue('syncMode', 'range');
    setValue('startDate', startOfDay(subDays(new Date(), daysBack)));
    setValue('endDate', endOfDay(new Date()));
    setSyncMode('range');
  };

  const calculateEstimatedActivities = () => {
    if (watchedSyncMode === 'days' && days) {
      return Math.round(days * 0.5); // Rough estimate: 0.5 activities per day
    } else if (watchedSyncMode === 'range' && startDate && endDate) {
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return Math.round(daysDiff * 0.5);
    }
    return 0;
  };

  // Check both garminCredentials from auth store and user data
  const hasGarminCredentials = garminCredentials?.hasCredentials || user?.has_garmin_credentials;

  // Handle task completion
  const handleTaskComplete = (result: any) => {
    console.log('Sync & processing completed:', result);
    // Clear the active task to hide progress
    setTimeout(() => {
      setActiveTaskId(null);
      // Reset form on success
      reset();
    }, 5000); // Show success for 5 seconds
  };

  // Handle task error
  const handleTaskError = (error: string) => {
    console.error('Sync & processing failed:', error);
    // Clear the active task to hide progress and show error
    setActiveTaskId(null);
  };

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

  // If there's an active task, show progress instead of form
  if (activeTaskId) {
    return (
      <div className="space-y-6">
        <TaskProgress 
          taskId={activeTaskId} 
          onComplete={handleTaskComplete}
          onError={handleTaskError}
        />
        <Button 
          variant="outline" 
          onClick={() => setActiveTaskId(null)}
          className="w-full"
        >
          Start Another Sync
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sync & Process Activities
        </CardTitle>
        <CardDescription>
          Sync activities from Garmin Connect and process them for AI chat. This includes both data sync and AI ingestion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sync Mode Selector */}
          <div>
            <h4 className="text-sm font-medium mb-3">Sync Mode</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={watchedSyncMode === 'days' ? 'default' : 'outline'}
                onClick={() => {
                  setValue('syncMode', 'days');
                  setSyncMode('days');
                }}
                className="justify-center"
              >
                <ToggleLeft className="h-4 w-4 mr-2" />
                Days Back
              </Button>
              <Button
                type="button"
                variant={watchedSyncMode === 'range' ? 'default' : 'outline'}
                onClick={() => {
                  setValue('syncMode', 'range');
                  setSyncMode('range');
                }}
                className="justify-center"
              >
                <ToggleRight className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>

          {/* Days Mode */}
          {watchedSyncMode === 'days' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={days === 7 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDaysPreset(7)}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    type="button"
                    variant={days === 30 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDaysPreset(30)}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    type="button"
                    variant={days === 60 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDaysPreset(60)}
                  >
                    Last 60 days
                  </Button>
                  <Button
                    type="button"
                    variant={days === 90 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDaysPreset(90)}
                  >
                    Last 90 days
                  </Button>
                  <Button
                    type="button"
                    variant={days === 365 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDaysPreset(365)}
                  >
                    Last year
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Custom Days</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={days}
                  onChange={(e) => setValue('days', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={isStartingSyncLoading}
                />
              </div>
            </div>
          )}

          {/* Date Range Mode */}
          {watchedSyncMode === 'range' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Quick Date Ranges</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangePreset(7)}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangePreset(30)}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangePreset(90)}
                  >
                    Last 3 months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangePreset(365)}
                  >
                    Last year
                  </Button>
                </div>
              </div>

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
            </div>
          )}

          {/* Advanced Options */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-4">Advanced Options</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="force_resync"
                  checked={forceResync}
                  onChange={(e) => setValue('force_resync', e.target.checked)}
                  className="rounded border-border"
                  disabled={isStartingSyncLoading}
                />
                <label htmlFor="force_resync" className="text-sm">
                  Force re-sync existing activities
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="force_reingest"
                  checked={forceReingest}
                  onChange={(e) => setValue('force_reingest', e.target.checked)}
                  className="rounded border-border"
                  disabled={isStartingSyncLoading}
                />
                <label htmlFor="force_reingest" className="text-sm">
                  Force re-process for AI chat (re-ingestion)
                </label>
              </div>

              <div>
                <label htmlFor="batch_size" className="text-sm font-medium mb-2 block">
                  Processing Batch Size (1-50)
                </label>
                <input
                  type="number"
                  id="batch_size"
                  min="1"
                  max="50"
                  value={batchSize}
                  onChange={(e) => setValue('batch_size', parseInt(e.target.value))}
                  className="w-20 p-2 border rounded-md bg-background"
                  disabled={isStartingSyncLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Smaller batches are more reliable but slower
                </p>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}

          {/* Estimated Activities */}
          {((watchedSyncMode === 'days' && days) || (watchedSyncMode === 'range' && startDate && endDate)) && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Estimated {calculateEstimatedActivities()} activities to sync
                  {watchedSyncMode === 'days' && days && ` from the last ${days} days`}
                  {watchedSyncMode === 'range' && startDate && endDate && 
                    ` from ${format(startDate, 'MMM d, yyyy')} to ${format(endDate, 'MMM d, yyyy')}`
                  }
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
                  Sync & processing started successfully!
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Task ID: {startSyncResult.data.task_id}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                This will sync activities from Garmin and process them for AI chat
              </p>
            </div>
          )}

          {startSyncError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Failed to start sync & processing
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
            disabled={
              isStartingSyncLoading || 
              (watchedSyncMode === 'days' ? !days : (!startDate || !endDate))
            }
          >
            {isStartingSyncLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Sync & Processing...
              </>
            ) : (
              'Start Sync & Process Activities'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}