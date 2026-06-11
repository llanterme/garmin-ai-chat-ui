'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TrendChartCardProps {
  title: string;
  currentValue?: string;
  trend?: 'up' | 'down' | 'flat';
  improvingDirection?: 'up' | 'down';
  children: React.ReactNode;
}

function TrendArrow({ trend, improvingDirection }: { trend: 'up' | 'down' | 'flat'; improvingDirection: 'up' | 'down' }) {
  const isImproving = trend === improvingDirection;
  const isFlat = trend === 'flat';

  if (isFlat) return <span className="text-muted-foreground text-xs">→</span>;

  return (
    <span className={cn('text-xs font-medium', isImproving ? 'text-emerald-500' : 'text-rose-500')}>
      {trend === 'up' ? '↑' : '↓'}
    </span>
  );
}

export function TrendChartCard({ title, currentValue, trend, improvingDirection = 'up', children }: TrendChartCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium font-display text-foreground">{title}</span>
          <div className="flex items-center gap-1.5">
            {currentValue && (
              <span className="text-sm font-bold tabular-nums text-foreground">{currentValue}</span>
            )}
            {trend && trend !== 'flat' && (
              <TrendArrow trend={trend} improvingDirection={improvingDirection} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <div className="h-64">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
