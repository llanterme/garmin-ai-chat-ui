import { Metadata } from 'next';
import { RefreshCw, History } from 'lucide-react';
import { StartSyncForm } from '@/components/sync/start-sync-form';
import { SyncJobsList } from '@/components/sync/sync-jobs-list';

export const metadata: Metadata = {
  title: 'Activity Sync - Garmin AI Chat',
  description: 'Sync your Garmin Connect activities and monitor sync progress',
};

export default function SyncPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
          <RefreshCw className="h-8 w-8" />
          Activity Sync
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Sync your Garmin Connect activities and monitor sync progress in real-time.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Start New Sync */}
        <div>
          <StartSyncForm />
        </div>

        {/* Right Column - Sync History */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <History className="h-5 w-5" />
              Sync History
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor your sync jobs and their progress.
            </p>
          </div>
          <SyncJobsList limit={5} showCreateNew={false} />
        </div>
      </div>
    </div>
  );
}