'use client';

import Link from 'next/link';
import { TrendingUp, AlertTriangle, BarChart3, Trophy, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostSyncInsight } from '@/types';

const typeConfig = {
  improvement: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/5',
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
  },
  concern: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  pattern: {
    border: 'border-l-sky-500',
    bg: 'bg-sky-500/5',
    icon: BarChart3,
    iconColor: 'text-sky-500',
  },
  milestone: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500/5',
    icon: Trophy,
    iconColor: 'text-purple-500',
  },
  tip: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    icon: Lightbulb,
    iconColor: 'text-blue-500',
  },
} satisfies Record<PostSyncInsight['type'], { border: string; bg: string; icon: React.ElementType; iconColor: string }>;

interface InsightCardProps {
  insight: string;
  type: PostSyncInsight['type'];
}

export function InsightCard({ insight, type }: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const excerptRaw = insight.slice(0, 80);
  const excerpt = insight.length > 80 ? excerptRaw.trimEnd() + '...' : excerptRaw;
  const chatQuery = `Tell me more about: ${excerpt}`;

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 px-4 py-3',
        config.border,
        config.bg,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
          <div className="flex justify-end mt-2">
            <Link
              href={`/chat?query=${encodeURIComponent(chatQuery)}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Ask AI
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
