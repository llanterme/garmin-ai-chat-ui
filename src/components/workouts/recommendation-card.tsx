'use client';

import { WorkoutRecommendation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TYPE_BORDER: Record<string, string> = {
  AEROBIC_BASE: 'border-l-blue-500',
  AEROBIC: 'border-l-blue-500',
  TEMPO: 'border-l-amber-500',
  THRESHOLD: 'border-l-orange-500',
  VO2MAX: 'border-l-red-500',
  RECOVERY: 'border-l-emerald-500',
  REST: 'border-l-slate-400',
};

const RISK_STYLE: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  MODERATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

interface RecommendationCardProps {
  recommendation: WorkoutRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const typeKey = recommendation.recommendationType.toUpperCase();
  const riskKey = recommendation.riskLevel.toUpperCase();
  const borderClass = TYPE_BORDER[typeKey] ?? 'border-l-slate-400';
  const riskClass = RISK_STYLE[riskKey] ?? RISK_STYLE.LOW;

  return (
    <Card
      className={cn(
        'border-l-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        borderClass
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold uppercase tracking-wide">
                {recommendation.recommendationType.replace(/_/g, ' ')}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-sm text-muted-foreground">
                {recommendation.durationMinutes} min
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{recommendation.intensityDescription}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', riskClass)}>
              {riskKey} RISK
            </span>
            <span className="text-xs text-muted-foreground">
              {recommendation.confidence.toFixed(1)} conf
            </span>
          </div>
        </div>

        {recommendation.reasoningSummary && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
            {recommendation.reasoningSummary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
