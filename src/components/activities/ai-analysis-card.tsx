'use client';

import { Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useActivityAnalysis } from '@/hooks/use-activities';

interface AIAnalysisCardProps {
  activityId: string;
  activityName: string;
  activityDate: string;
}

// Helper function to format label text (snake_case → Title Case)
function formatLabel(text: string): string {
  if (!text) return 'Unknown';

  // Special cases for acronyms and common terms
  const specialCases: Record<string, string> = {
    vo2max: 'VO2max',
    aerobic_base: 'Aerobic Base',
    tempo: 'Tempo',
    threshold: 'Threshold',
    recovery: 'Recovery',
    strength: 'Strength',
    mixed: 'Mixed',
    easy: 'Easy',
    moderate: 'Moderate',
    hard: 'Hard',
    very_hard: 'Very Hard',
  };

  const normalized = text.toLowerCase().replace(/ /g, '_');
  if (specialCases[normalized]) {
    return specialCases[normalized];
  }

  // Default: capitalize each word
  return text
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get styling for training stimulus badges
function getStimulusColors(stimulus: string): string {
  if (!stimulus) return 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  const normalized = stimulus.toLowerCase().replace(/ /g, '_');
  const colorMap: Record<string, string> = {
    aerobic_base: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    tempo: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    threshold: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    vo2max: 'bg-red-500/10 text-red-500 border-red-500/20',
    recovery: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    strength: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    mixed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
  return colorMap[normalized] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
}

// Get styling for effort level badges
function getEffortColors(effort: string): string {
  if (!effort) return 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  const normalized = effort.toLowerCase().replace(/ /g, '_');
  const colorMap: Record<string, string> = {
    easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    moderate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    hard: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    very_hard: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return colorMap[normalized] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
}

export function AIAnalysisCard({
  activityId,
  activityName,
  activityDate,
}: AIAnalysisCardProps) {
  const { data: analysis, isLoading, error } = useActivityAnalysis(activityId);

  // Fail silently - don't render if error or no data
  if (error || (!isLoading && !analysis)) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Training Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-muted rounded-full"></div>
              <div className="h-6 w-20 bg-muted rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Analyzing your workout...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Main content
  if (!analysis) {
    return null;
  }

  // Build chat URL with pre-filled query
  const chatQuery = `Tell me more about my ${activityName} on ${new Date(activityDate).toLocaleDateString()}`;
  const chatUrl = `/chat?query=${encodeURIComponent(chatQuery)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Training Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badges for Training Stimulus and Effort Level */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn('border', getStimulusColors(analysis.trainingStimulus))}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {formatLabel(analysis.trainingStimulus)}
          </Badge>
          <Badge
            variant="outline"
            className={cn('border', getEffortColors(analysis.effortLevel))}
          >
            {formatLabel(analysis.effortLevel)}
          </Badge>
        </div>

        {/* Analysis Text with Markdown Support */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          <ReactMarkdown
            components={{
              // Customize rendering to match design system
              p: ({ children }) => (
                <p className="text-sm text-foreground leading-relaxed mb-3 last:mb-0">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-muted-foreground">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-foreground">{children}</li>
              ),
            }}
          >
            {analysis.analysis}
          </ReactMarkdown>
        </div>

        {/* Call to Action - Ask AI */}
        <div className="pt-2 border-t">
          <Link
            href={chatUrl}
            className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Ask AI about this
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
