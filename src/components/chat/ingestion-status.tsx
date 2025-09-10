'use client';

import { useEffect } from 'react';
import { 
  Database, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Play,
} from 'lucide-react';

import { useChat } from '@/hooks/use-chat';
import { useSync } from '@/hooks/use-sync';
import { useActivities } from '@/hooks/use-activities';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface IngestionStatusProps {
  onIngestionComplete?: () => void;
}

export function IngestionStatus({ onIngestionComplete }: IngestionStatusProps) {
  const router = useRouter();
  
  // Use activities endpoint to check sync status instead of deprecated ingestion status
  const { useSyncStatus } = useActivities({ page: 1, limit: 1 });
  const { data: syncStatus, isLoading, error, refetch } = useSyncStatus();

  // Determine if user has synced activities
  const isIngestionComplete = syncStatus && syncStatus.hasSynced;
  
  // Call onIngestionComplete when ingestion is completed
  useEffect(() => {
    if (isIngestionComplete && onIngestionComplete) {
      onIngestionComplete();
    }
  }, [isIngestionComplete, onIngestionComplete]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking ingestion status...</span>
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
            <AlertTriangle className="h-5 w-5" />
            Error Loading Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Unable to check ingestion status. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!syncStatus) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to check sync status</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (!syncStatus.hasSynced) {
      return <Database className="h-5 w-5 text-muted-foreground" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    if (!syncStatus.hasSynced) {
      return 'text-muted-foreground bg-muted/50 border-muted';
    } else {
      return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/20 dark:border-green-800';
    }
  };

  const getStatusTitle = () => {
    if (!syncStatus.hasSynced) {
      return 'No Activities Synced';
    } else {
      return 'Activities Ready for Chat';
    }
  };

  const getStatusDescription = () => {
    if (!syncStatus.hasSynced) {
      return 'No activities found in your account. Please sync your activities first using the Sync page to enable AI chat features.';
    } else {
      return `You have ${syncStatus.totalActivities} synced activities ready for AI analysis. You can now start asking questions about your training data!`;
    }
  };

  const getStatusText = () => {
    if (!syncStatus.hasSynced) {
      return 'NO ACTIVITIES';
    } else {
      return 'READY';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusTitle()}
          </CardTitle>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
        <CardDescription>
          {getStatusDescription()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Activity Count */}
        {syncStatus.hasSynced && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Activities</span>
              <span className="font-medium">{syncStatus.totalActivities.toLocaleString()}</span>
            </div>
            {syncStatus.mostRecentActivity && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Most Recent</span>
                <span className="text-sm">
                  {syncStatus.mostRecentActivity.activity_type} - {new Date(syncStatus.mostRecentActivity.start_time).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!syncStatus.hasSynced && (
            <div className="w-full space-y-3">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium text-center">
                ⚠️ No activities found. Please sync your Garmin data first.
              </p>
              <Button
                onClick={() => router.push('/sync')}
                variant="outline"
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                Go to Sync Activities
              </Button>
            </div>
          )}

          {syncStatus.hasSynced && (
            <div className="w-full text-center">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Ready to chat! Ask questions about your training data.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}