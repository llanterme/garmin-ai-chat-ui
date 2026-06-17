'use client';

import Link from 'next/link';
import { Dumbbell, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { TrainingSnapshot } from '@/components/workouts/training-snapshot';
import { useWorkouts } from '@/hooks/use-workouts';
import { usePostSyncInsight, useMilestones } from '@/hooks/use-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AskAiLink } from '@/components/ui/ask-ai-link';
import { InsightCard } from '@/components/dashboard/insight-card';
import { MilestonesCard } from '@/components/dashboard/milestones-card';

function ZoneRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function SkeletonZoneRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-14 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

export function DashboardMetrics() {
  const { useTrainingMetrics } = useWorkouts();
  const { data: metrics, isLoading } = useTrainingMetrics();
  const { data: insight } = usePostSyncInsight();
  const { data: milestonesData } = useMilestones();

  const running = metrics?.performanceMetrics?.running;
  const cycling = metrics?.performanceMetrics?.cycling;
  const hasRunning = running && Object.values(running).some(Boolean);
  const hasCycling = cycling && Object.values(cycling).some(Boolean);
  const hasZones = hasRunning || hasCycling;

  const getCTAContent = () => {
    if (!metrics) {
      return {
        message: "Ready for today's workout?",
        subtext: "Let AI plan your training based on your data",
        variant: "default" as const,
        query: "What should I do today?",
      };
    }

    const acr = metrics.acuteChronicRatio;
    const daysSinceRest = metrics.daysSinceRestDay;

    if (daysSinceRest !== null && daysSinceRest >= 7) {
      return {
        message: `It's been ${daysSinceRest} days since rest — let's check if you need recovery`,
        subtext: "Your body adapts during rest, not during training",
        variant: "warning" as const,
        query: "Should I take a rest day?",
      };
    }
    if (daysSinceRest !== null && daysSinceRest >= 5) {
      return {
        message: `${daysSinceRest} days since rest — shall we plan something easy?`,
        subtext: "A recovery day could help you come back stronger",
        variant: "warning" as const,
        query: "Should I take a rest day?",
      };
    }
    if (acr > 1.3) {
      return {
        message: "Your training load is high — let's plan carefully",
        subtext: `ACR is ${acr.toFixed(2)} — recovery might be the best session today`,
        variant: "warning" as const,
        query: "My training load seems high, what should I do?",
      };
    }

    return {
      message: "What should I do today?",
      subtext: `ACR ${acr.toFixed(2)} · ${metrics.hardSessions7Days} hard sessions this week · Let AI plan your workout`,
      variant: "default" as const,
      query: "What should I do today?",
    };
  };

  const cta = getCTAContent();

  return (
    <div className="space-y-4">
      {/* Training snapshot */}
      <TrainingSnapshot />

      {/* Post-sync insight card */}
      {insight && (
        <InsightCard insight={insight.insight} type={insight.type} />
      )}

      {/* Milestones card */}
      {milestonesData && milestonesData.milestones.length > 0 && (
        <MilestonesCard milestones={milestonesData.milestones} />
      )}

      {/* AI CTA card */}
      <Card className={cta.variant === "warning" ? "border-amber-500/30 bg-amber-500/5" : "border-primary/30 bg-primary/5"}>
        <CardContent className="flex items-center gap-4 py-4 px-5">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${cta.variant === "warning" ? "bg-amber-500/10" : "bg-primary/10"}`}>
            <Sparkles className={`h-5 w-5 ${cta.variant === "warning" ? "text-amber-500" : "text-primary"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {cta.message}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cta.subtext}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/chat?query=${encodeURIComponent(cta.query)}`}>
              Let&apos;s go
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/workouts">
            <Dumbbell className="h-4 w-4" />
            Today&apos;s Workout
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/chat">
            <MessageCircle className="h-4 w-4" />
            AI Chat
          </Link>
        </Button>
      </div>

      {/* Performance zones */}
      {(isLoading || hasZones) && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Performance Zones</CardTitle>
              <AskAiLink query="What do my training zones mean and how should I use them?" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-6">
                <SkeletonZoneRows />
                <SkeletonZoneRows />
              </div>
            ) : (
              <div className="flex gap-8 flex-wrap">
                {hasRunning && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Running</p>
                    <ZoneRow label="VO2max" value={running?.vo2maxPace} />
                    <ZoneRow label="Threshold" value={running?.thresholdPace} />
                    <ZoneRow label="Tempo" value={running?.tempoPace} />
                    <ZoneRow label="Aerobic" value={running?.aerobicPace} />
                    <ZoneRow label="Easy" value={running?.easyPace} />
                  </div>
                )}
                {hasRunning && hasCycling && (
                  <div className="w-px bg-border self-stretch" />
                )}
                {hasCycling && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cycling</p>
                    <ZoneRow label="VO2max" value={cycling?.vo2maxWatts != null ? `${cycling.vo2maxWatts}W` : undefined} />
                    <ZoneRow label="Threshold" value={cycling?.thresholdWatts != null ? `${cycling.thresholdWatts}W` : undefined} />
                    <ZoneRow label="Tempo" value={cycling?.tempoWatts != null ? `${cycling.tempoWatts}W` : undefined} />
                    <ZoneRow label="Aerobic" value={cycling?.aerobicWatts != null ? `${cycling.aerobicWatts}W` : undefined} />
                    <ZoneRow label="Easy" value={cycling?.easyWatts != null ? `${cycling.easyWatts}W` : undefined} />
                  </div>
                )}
              </div>
            )}
            {metrics?.performanceMetrics && (metrics.performanceMetrics.runningSource || metrics.performanceMetrics.cyclingSource) && (
              <p className="text-[11px] text-muted-foreground mt-3">
                computed from activity data
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
