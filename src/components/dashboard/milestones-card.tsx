'use client';

import Link from 'next/link';
import { TrendingUp, Flame, Activity, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrainingMilestone } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const typeConfig = {
  improvement: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/10',
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    badgeText: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10',
    label: 'Improvement',
  },
  consistency: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-500/10',
    icon: Flame,
    iconColor: 'text-orange-500',
    badgeText: 'text-orange-500',
    badgeBg: 'bg-orange-500/10',
    label: 'Streak',
  },
  volume: {
    border: 'border-l-sky-500',
    bg: 'bg-sky-500/10',
    icon: Activity,
    iconColor: 'text-sky-500',
    badgeText: 'text-sky-500',
    badgeBg: 'bg-sky-500/10',
    label: 'Volume',
  },
  personal_best: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500/10',
    icon: Trophy,
    iconColor: 'text-purple-500',
    badgeText: 'text-purple-500',
    badgeBg: 'bg-purple-500/10',
    label: 'Personal Best',
  },
} satisfies Record<TrainingMilestone['type'], {
  border: string;
  bg: string;
  icon: React.ElementType;
  iconColor: string;
  badgeText: string;
  badgeBg: string;
  label: string;
}>;

interface Props {
  milestones: TrainingMilestone[];
}

export function MilestonesCard({ milestones }: Props) {
  if (milestones.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Achievements</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const config = typeConfig[milestone.type];
            const Icon = config.icon;
            const chatQuery = `Tell me more about my ${milestone.title.toLowerCase()}`;

            return (
              <div
                key={index}
                className={cn(
                  'rounded-lg border border-l-4 px-4 py-3',
                  config.border,
                  config.bg,
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                      {milestone.value !== null && (
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                            config.badgeBg,
                            config.badgeText,
                          )}
                        >
                          {milestone.value}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {milestone.description}
                    </p>
                    <Link
                      href={`/chat?query=${encodeURIComponent(chatQuery)}`}
                      className="inline-block mt-1.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      Ask AI →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
