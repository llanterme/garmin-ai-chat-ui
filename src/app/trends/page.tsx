'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTrainingTrends } from '@/hooks/use-workouts';
import { TimeRangeToggle } from '@/components/trends/time-range-toggle';
import { TrainingLoadChart } from '@/components/trends/training-load-chart';
import { AcrChart } from '@/components/trends/acr-chart';
import { FtpChart } from '@/components/trends/ftp-chart';
import { ThresholdPaceChart } from '@/components/trends/threshold-pace-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function SkeletonChartCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export default function TrendsPage() {
  const [days, setDays] = useState(90);
  const { data, isLoading, error, refetch } = useTrainingTrends({ days });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Training Trends</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your fitness progression over time</p>
        </div>
        <TimeRangeToggle value={days} onChange={setDays} />
      </div>

      {error && (
        <Card>
          <CardContent className="py-8 flex items-center justify-between px-6">
            <span className="text-sm text-muted-foreground">
              {(error as Error).message.includes('502') || (error as Error).message.includes('503')
                ? 'Trends service unavailable — make sure garmin-adapter is running.'
                : `Could not load trends: ${(error as Error).message}`}
            </span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChartCard />
          <SkeletonChartCard />
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
      )}

      {data && data.dataPoints.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrainingLoadChart data={data.dataPoints} />
          <AcrChart data={data.dataPoints} />
          <FtpChart data={data.dataPoints} />
          <ThresholdPaceChart data={data.dataPoints} />
        </div>
      )}

      {data && data.dataPoints.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No trend data available for this period.</p>
            <p className="text-muted-foreground text-xs mt-1">Sync more activities to build your training history.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
