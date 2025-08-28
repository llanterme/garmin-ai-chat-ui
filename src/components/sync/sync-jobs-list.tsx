'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Activity,
} from 'lucide-react';

import { useSync } from '@/hooks/use-sync';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { SyncJob } from '@/types';

interface SyncJobCardProps {
  job: SyncJob;
  onCancel: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  isActionLoading?: boolean;
}

function SyncJobCard({
  job,
  onCancel,
  onRetry,
  onDelete,
  isActionLoading = false,
}: SyncJobCardProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/20 dark:border-amber-800';
      case 'running':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/20 dark:border-blue-800';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/20 dark:border-green-800';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/20 dark:border-red-800';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const calculateProgress = () => {
    if (!job.totalActivities || job.totalActivities === 0) return 0;
    return Math.round((job.processedActivities / job.totalActivities) * 100);
  };

  const canCancel = job.status === 'pending' || job.status === 'running';
  const canRetry = job.status === 'failed';
  const canDelete = job.status === 'completed' || job.status === 'failed';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            <span className="capitalize">{job.status} Sync</span>
          </CardTitle>
          <div
            className={`px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor()}`}
          >
            {job.status.toUpperCase()}
          </div>
        </div>
        <CardDescription>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(job.startDate), 'MMM d')} -{' '}
              {format(new Date(job.endDate), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDateTime(job.createdAt)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Activities: {job.processedActivities}
              {job.totalActivities ? ` of ${job.totalActivities}` : ''}
            </span>
            <span className="text-sm font-medium">
              {calculateProgress()}%
            </span>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
        </div>

        {/* Error Message */}
        {job.error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{job.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(job.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
              Cancel
            </Button>
          )}
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(job.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Retry
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(job.id)}
              disabled={isActionLoading}
              className="text-destructive hover:text-destructive"
            >
              {isActionLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SyncJobsListProps {
  limit?: number;
  showCreateNew?: boolean;
}

export function SyncJobsList({ limit = 10, showCreateNew = false }: SyncJobsListProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    useSyncJobs, 
    cancelSync, 
    retrySync, 
    deleteSyncJob,
    isCancellingSyncLoading,
    isRetryingSyncLoading,
    isDeletingSyncLoading
  } = useSync();

  const { data: syncJobsData, isLoading, error } = useSyncJobs({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const isActionLoading = isCancellingSyncLoading || isRetryingSyncLoading || isDeletingSyncLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-2 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Failed to load sync jobs. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!syncJobsData?.jobs || syncJobsData.jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            No sync jobs found. Start your first activity sync to see progress here.
          </p>
          {showCreateNew && (
            <Button asChild>
              <a href="/sync/new">Start New Sync</a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'running' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('running')}
        >
          Running
        </Button>
        <Button
          variant={statusFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={statusFilter === 'failed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('failed')}
        >
          Failed
        </Button>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {syncJobsData.jobs.map((job) => (
          <SyncJobCard
            key={job.id}
            job={job}
            onCancel={cancelSync}
            onRetry={retrySync}
            onDelete={deleteSyncJob}
            isActionLoading={isActionLoading}
          />
        ))}
      </div>

      {/* Pagination */}
      {syncJobsData.total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(syncJobsData.total / limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(syncJobsData.total / limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}