'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useWorkouts } from '@/hooks/use-workouts';
import { WeeklyPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DailyPlanCard } from './daily-plan-card';

const WEEKLY_PLAN_STORAGE_KEY = 'athlete-iq-weekly-plan';
const LOADING_MESSAGES = [
  'Planning Day 1 of 7…',
  'Planning Day 2 of 7…',
  'Planning Day 3 of 7…',
  'Planning Day 4 of 7…',
  'Planning Day 5 of 7…',
  'Planning Day 6 of 7…',
  'Planning Day 7 of 7…',
  'Finalising your plan…',
];

function saveWeeklyPlan(plan: WeeklyPlan): void {
  try {
    localStorage.setItem(WEEKLY_PLAN_STORAGE_KEY, JSON.stringify(plan));
  } catch (e) {
    console.warn('Failed to save weekly plan to localStorage:', e);
  }
}

function loadWeeklyPlan(): WeeklyPlan | null {
  try {
    const stored = localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY);
    if (!stored) return null;
    const plan = JSON.parse(stored) as WeeklyPlan;
    const weekEnd = new Date(plan.weekEnd + 'T00:00:00');
    if (weekEnd < new Date()) {
      localStorage.removeItem(WEEKLY_PLAN_STORAGE_KEY);
      return null;
    }
    return plan;
  } catch (e) {
    console.warn('Failed to load weekly plan from localStorage:', e);
    return null;
  }
}

function clearWeeklyPlan(): void {
  localStorage.removeItem(WEEKLY_PLAN_STORAGE_KEY);
}

export function WeeklyPlanView() {
  const {
    generateWeeklyPlanAsync,
    weeklyPlan,
    isGeneratingWeeklyPlan,
    weeklyPlanError,
    resetWeeklyPlan,
  } = useWorkouts();

  const [cachedPlan, setCachedPlan] = useState<WeeklyPlan | null>(() => loadWeeklyPlan());
  const [loadingStep, setLoadingStep] = useState(0);

  const displayPlan = weeklyPlan || cachedPlan;

  // Simulate progress ticks while generating
  useEffect(() => {
    if (!isGeneratingWeeklyPlan) {
      setLoadingStep(0);
      return;
    }
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, LOADING_MESSAGES.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isGeneratingWeeklyPlan]);

  const handleGenerate = async () => {
    try {
      const plan = await generateWeeklyPlanAsync(undefined);
      if (plan) {
        saveWeeklyPlan(plan);
        setCachedPlan(plan);
      }
    } catch {
      // surfaced via weeklyPlanError
    }
  };

  const handleReset = () => {
    resetWeeklyPlan();
    clearWeeklyPlan();
    setCachedPlan(null);
  };

  const weekHeader = displayPlan
    ? `Week of ${format(parseISO(displayPlan.weekStart), 'MMM d')} – ${format(parseISO(displayPlan.weekEnd), 'MMM d')}`
    : null;

  const running = displayPlan?.performanceMetrics?.running as Record<string, string> | undefined;
  const cycling = displayPlan?.performanceMetrics?.cycling as Record<string, number> | undefined;
  const hasMetrics = (running && Object.values(running).some(Boolean)) ||
    (cycling && Object.values(cycling).some(Boolean));

  return (
    <div className="space-y-5">
      {/* Generate button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleGenerate}
          disabled={isGeneratingWeeklyPlan}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isGeneratingWeeklyPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {displayPlan ? 'Regenerate Weekly Plan' : 'Generate Weekly Plan'}
        </Button>
        {displayPlan && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isGeneratingWeeklyPlan && (
        <Card>
          <CardContent className="py-8 px-6 space-y-2">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Generating your weekly plan…</p>
                <p className="text-xs text-muted-foreground">This takes about 20 seconds.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-8">{LOADING_MESSAGES[loadingStep]}</p>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {weeklyPlanError && !isGeneratingWeeklyPlan && (
        <Card>
          <CardContent className="py-5 px-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {weeklyPlanError.message.includes('502') || weeklyPlanError.message.includes('503')
                ? 'Workout service unavailable — make sure garmin-adapter is running.'
                : `Could not generate weekly plan: ${weeklyPlanError.message}`}
            </span>
            <Button variant="ghost" size="sm" onClick={handleGenerate}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Plan content */}
      {displayPlan && !isGeneratingWeeklyPlan && (
        <div className="space-y-4">
          {weekHeader && (
            <p className="text-sm font-medium text-foreground">{weekHeader}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayPlan.days.map((day) => (
              <DailyPlanCard key={day.dayNumber} plan={day} />
            ))}
          </div>

          {/* Performance metrics footer */}
          {hasMetrics && (
            <div className="border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Performance Metrics</span>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {running?.thresholdPace && <span>Threshold {running.thresholdPace}</span>}
                {running?.tempoPace && <span>Tempo {running.tempoPace}</span>}
                {running?.aerobicPace && <span>Aerobic {running.aerobicPace}</span>}
                {running?.easyPace && <span>Easy {running.easyPace}</span>}
                {cycling?.ftpWatts && <span>FTP {cycling.ftpWatts}W</span>}
                {cycling?.thresholdWatts && <span>Threshold {cycling.thresholdWatts}W</span>}
                {cycling?.tempoWatts && <span>Tempo {cycling.tempoWatts}W</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
