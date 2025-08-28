'use client';

import { useEffect } from 'react';
import { 
  Database, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Play, 
  AlertTriangle,
  Activity,
} from 'lucide-react';

import { useChat } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface IngestionStatusProps {
  onIngestionComplete?: () => void;
}

export function IngestionStatus({ onIngestionComplete }: IngestionStatusProps) {
  const { 
    useIngestionStatus, 
    startIngestion, 
    isStartingIngestion 
  } = useChat();

  const { data: status, isLoading, error, refetch } = useIngestionStatus();

  // Call onIngestionComplete when ingestion is completed
  useEffect(() => {
    if (status?.status === 'completed' && onIngestionComplete) {
      onIngestionComplete();
    }
  }, [status?.status, onIngestionComplete]);

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
            <XCircle className="h-5 w-5" />
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

  if (!status) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No status information available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'not_started':
        return <Database className="h-5 w-5 text-muted-foreground" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'not_started':
        return 'text-muted-foreground bg-muted/50 border-muted';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/20 dark:border-blue-800';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/20 dark:border-green-800';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/20 dark:border-red-800';
      default:
        return 'text-muted-foreground bg-muted/50 border-muted';
    }
  };

  const calculateProgress = () => {
    if (status.totalActivities === 0) return 0;
    return Math.round((status.processedActivities / status.totalActivities) * 100);
  };

  const getStatusTitle = () => {
    switch (status.status) {
      case 'not_started':
        return 'Activities Not Ingested';
      case 'in_progress':
        return 'Processing Activities';
      case 'completed':
        return 'Activities Ready for Chat';
      case 'failed':
        return 'Ingestion Failed';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusDescription = () => {
    switch (status.status) {
      case 'not_started':
        return 'Your activities need to be processed before you can start chatting. This will create AI embeddings of your activity data.';
      case 'in_progress':
        return 'We\'re processing your activities and creating AI embeddings. This may take a few minutes depending on how many activities you have.';
      case 'completed':
        return 'All your activities have been processed and are ready for AI analysis. You can now start asking questions!';
      case 'failed':
        return 'There was an error processing your activities. Please try starting the ingestion process again.';
      default:
        return 'Unknown ingestion status.';
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
            {status.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        <CardDescription>
          {getStatusDescription()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        {status.status === 'in_progress' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Processing: {status.processedActivities} of {status.totalActivities} activities
              </span>
              <span className="text-sm font-medium">
                {calculateProgress()}%
              </span>
            </div>
            <Progress value={calculateProgress()} className="w-full" />
            {status.estimatedTimeRemaining && (
              <p className="text-xs text-muted-foreground mt-2">
                Estimated time remaining: {Math.round(status.estimatedTimeRemaining / 60)} minutes
              </p>
            )}
          </div>
        )}

        {/* Activity Count */}
        {status.totalActivities > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Activities</span>
              <span className="font-medium">{status.totalActivities.toLocaleString()}</span>
            </div>
            {status.status === 'completed' && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {new Date(status.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {status.status === 'not_started' && (
            <Button
              onClick={() => startIngestion()}
              disabled={isStartingIngestion}
              className="w-full"
            >
              {isStartingIngestion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Processing Activities
                </>
              )}
            </Button>
          )}

          {status.status === 'failed' && (
            <Button
              onClick={() => startIngestion()}
              disabled={isStartingIngestion}
              variant="outline"
              className="w-full"
            >
              {isStartingIngestion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Retry Processing
                </>
              )}
            </Button>
          )}

          {status.status === 'completed' && (
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