'use client';

import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'today' | 'weekly';
  onViewChange: (view: 'today' | 'weekly') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      <button
        onClick={() => onViewChange('today')}
        className={cn(
          'px-4 py-1.5 text-sm font-medium transition-colors',
          view === 'today'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        Today
      </button>
      <button
        onClick={() => onViewChange('weekly')}
        className={cn(
          'px-4 py-1.5 text-sm font-medium transition-colors',
          view === 'weekly'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        Weekly Plan
      </button>
    </div>
  );
}
