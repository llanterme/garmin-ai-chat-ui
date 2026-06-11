'use client';

import { useState } from 'react';
import { Loader2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkoutPlanRequest } from '@/types';

const SPORT_OPTIONS = ['Auto', 'running', 'cycling'];
const REC_TYPE_OPTIONS = ['Auto', 'RECOVERY', 'AEROBIC_BASE', 'TEMPO', 'THRESHOLD', 'VO2MAX'];

interface WorkoutControlsProps {
  onGenerateRecommendation: (request?: WorkoutPlanRequest) => void;
  onGenerateWorkoutPlan: (request?: WorkoutPlanRequest) => void;
  isGeneratingRecommendation: boolean;
  isGeneratingPlan: boolean;
  hasRecommendation: boolean;
}

export function WorkoutControls({
  onGenerateRecommendation,
  onGenerateWorkoutPlan,
  isGeneratingRecommendation,
  isGeneratingPlan,
  hasRecommendation,
}: WorkoutControlsProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [sport, setSport] = useState('Auto');
  const [durationStr, setDurationStr] = useState('');
  const [recType, setRecType] = useState('Auto');

  const buildRequest = (): WorkoutPlanRequest => ({
    sportOverride: sport !== 'Auto' ? sport : undefined,
    durationOverride: durationStr ? parseInt(durationStr, 10) : undefined,
    recommendationTypeOverride: recType !== 'Auto' ? recType : undefined,
  });

  const skipToplan = recType !== 'Auto';
  const isAnyLoading = isGeneratingRecommendation || isGeneratingPlan;

  const handlePrimary = () => {
    const req = buildRequest();
    if (skipToplan) {
      onGenerateWorkoutPlan(req);
    } else {
      onGenerateRecommendation(req);
    }
  };

  const selectClass =
    'h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="space-y-4">
      {/* Primary action */}
      <Button
        className="w-full sm:w-auto"
        size="lg"
        onClick={handlePrimary}
        disabled={isAnyLoading}
      >
        {isGeneratingRecommendation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {skipToplan ? 'Generate Workout Plan' : 'Generate Recommendation'}
      </Button>

      {/* Secondary: plan button always shown when not skipping, disabled until recommendation exists */}
      {!skipToplan && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => onGenerateWorkoutPlan(buildRequest())}
          disabled={isAnyLoading || !hasRecommendation}
          className="w-full sm:w-auto"
        >
          {isGeneratingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Workout Plan
        </Button>
      )}

      {/* Customize toggle */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowCustomize(o => !o)}
        >
          <Settings2 className="h-3 w-3" />
          {showCustomize ? 'Hide overrides' : 'Customize'}
        </button>

        {showCustomize && (
          <div className="mt-3 flex flex-wrap gap-4 items-end animate-in fade-in-0 duration-200">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sport-override" className="text-xs">Sport</Label>
              <select
                id="sport-override"
                className={selectClass}
                value={sport}
                onChange={e => setSport(e.target.value)}
              >
                {SPORT_OPTIONS.map(o => (
                  <option key={o} value={o}>{o === 'Auto' ? 'Auto-detect' : o.charAt(0).toUpperCase() + o.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration-override" className="text-xs">Duration (min)</Label>
              <Input
                id="duration-override"
                className="h-9 w-24"
                type="number"
                min={10}
                max={300}
                placeholder="Auto"
                value={durationStr}
                onChange={e => setDurationStr(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rec-type-override" className="text-xs">Type</Label>
              <select
                id="rec-type-override"
                className={selectClass}
                value={recType}
                onChange={e => setRecType(e.target.value)}
              >
                {REC_TYPE_OPTIONS.map(o => (
                  <option key={o} value={o}>{o === 'Auto' ? 'Auto' : o.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
