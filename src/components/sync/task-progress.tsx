'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Clock, Activity, Database } from 'lucide-react';

import { useSync } from '@/hooks/use-sync';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskProgressProps {
  taskId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function TaskProgress({ taskId, onComplete, onError }: TaskProgressProps) {
  const { useTaskStatus } = useSync();
  const { data: task, isLoading, error } = useTaskStatus(taskId);

  // Handle completion or error
  useEffect(() => {
    if (task?.status === 'completed' && task.result_data && onComplete) {
      onComplete(task.result_data);
    } else if (task?.status === 'failed' && task.error_message && onError) {
      onError(task.error_message);
    }
  }, [task?.status, task?.result_data, task?.error_message, onComplete, onError]);

  const getStatusIcon = () => {
    if (!task) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    
    switch (task.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    if (!task) return 'text-muted-foreground bg-muted/50 border-muted';
    
    switch (task.status) {
      case 'pending':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/20 dark:border-blue-800';
      case 'running':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/20 dark:border-blue-800';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/20 dark:border-green-800';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/20 dark:border-red-800';
      default:
        return 'text-muted-foreground bg-muted/50 border-muted';
    }
  };

  const getStatusText = () => {
    if (!task) return 'LOADING';
    return task.status.toUpperCase();
  };

  const getProgressPhase = (percentage: number) => {
    if (percentage < 25) return 'Initializing...';
    if (percentage < 60) return 'Syncing from Garmin...';
    if (percentage < 95) return 'Processing for AI...';
    return 'Finalizing...';
  };

  if (isLoading && !task) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading task status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error Loading Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Unable to load task status. The task may have been completed or failed.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Task not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {task.task_name || 'Sync & Process Activities'}
          </CardTitle>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
        <CardDescription>
          Task ID: {task.task_id}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {(task.status === 'running' || task.status === 'pending') && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {task.progress_message || getProgressPhase(task.progress_percentage)}
              </span>
              <span className="text-sm font-medium">
                {Math.round(task.progress_percentage)}%
              </span>
            </div>
            <Progress value={task.progress_percentage} className="w-full" />
          </div>
        )}

        {/* Timing Information */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(task.created_at).toLocaleString()}</span>
          </div>
          {task.started_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Started:</span>
              <span>{new Date(task.started_at).toLocaleString()}</span>
            </div>
          )}
          {task.completed_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed:</span>
              <span>{new Date(task.completed_at).toLocaleString()}</span>
            </div>
          )}
          {task.duration_seconds && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span>{task.duration_seconds}s</span>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {task.status === 'completed' && task.result_data && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Sync & Processing Complete
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-300">Activities Found:</span>
                <span className="font-medium">{task.result_data.activities_in_date_range}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-300">New Synced:</span>
                <span className="font-medium">{task.result_data.activities_synced}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-300">Already in DB:</span>
                <span className="font-medium">{task.result_data.activities_already_in_db}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-300">Vectorized:</span>
                <span className="font-medium">{task.result_data.vectorized_activities}</span>
              </div>
            </div>
            {task.result_data.activities_failed > 0 && (
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                ⚠️ {task.result_data.activities_failed} activities failed to sync
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {task.status === 'failed' && task.error_message && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Task Failed
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {task.error_message}
            </p>
          </div>
        )}

        {/* Status Message */}
        {task.status === 'pending' && (
          <div className="text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              ⏳ Task is queued and will start shortly...
            </p>
          </div>
        )}

        {task.status === 'running' && (
          <div className="text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
              <Activity className="h-4 w-4 animate-pulse" />
              Processing... Please keep this page open for real-time updates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}