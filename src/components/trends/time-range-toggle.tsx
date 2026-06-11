'use client';

import { cn } from '@/lib/utils';

const RANGES = [
  { label: '30d', value: 30 },
  { label: '60d', value: 60 },
  { label: '90d', value: 90 },
] as const;

interface TimeRangeToggleProps {
  value: number;
  onChange: (days: number) => void;
}

export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium transition-colors',
            value === range.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
