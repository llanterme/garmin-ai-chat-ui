'use client';

import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { TrendDataPoint } from '@/types';
import { TrendChartCard } from './trend-chart-card';

const GRID = '#2a2d3a';
const AXIS = '#8b8fa3';
const ROSE = '#f43f5e';

function paceToMinutes(pace: string | null): number | null {
  if (!pace) return null;
  const parts = pace.split(':');
  if (parts.length !== 2) return null;
  return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
}

function minutesToPace(mins: number): string {
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{minutesToPace(payload[0].value)}/km</p>
    </div>
  );
}

interface ThresholdPaceChartProps {
  data: TrendDataPoint[];
}

export function ThresholdPaceChart({ data }: ThresholdPaceChartProps) {
  const chartData = data
    .filter((d) => d.thresholdPace !== null)
    .map((d) => ({
      date: format(parseISO(d.weekEnd), 'MMM d'),
      pace: paceToMinutes(d.thresholdPace) as number,
      raw: d.thresholdPace,
    }));

  const nonNull = data.filter((d) => d.thresholdPace !== null);
  const first = nonNull[0];
  const last = nonNull[nonNull.length - 1];

  const firstPace = paceToMinutes(first?.thresholdPace ?? null);
  const lastPace = paceToMinutes(last?.thresholdPace ?? null);
  const trend = firstPace === null || lastPace === null || first === last
    ? 'flat'
    : lastPace < firstPace ? 'up' : 'down';
  const currentValue = last?.thresholdPace ? `${last.thresholdPace}/km` : undefined;

  if (chartData.length === 0) {
    return (
      <TrendChartCard title="Running Threshold Pace">
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No pace data available</p>
        </div>
      </TrendChartCard>
    );
  }

  const values = chartData.map((d) => d.pace);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max((maxVal - minVal) * 0.2, 0.1);

  return (
    <TrendChartCard
      title="Running Threshold Pace"
      currentValue={currentValue}
      trend={trend as 'up' | 'down' | 'flat'}
      improvingDirection="up"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 30, left: 8, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={chartData.length > 8 ? 2 : 0}
          />
          <YAxis
            tick={{ fill: AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[minVal - padding, maxVal + padding]}
            reversed
            tickFormatter={minutesToPace}
            width={44}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="pace"
            stroke={ROSE}
            strokeWidth={2}
            connectNulls
            dot={{ r: 3, fill: ROSE, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: ROSE, stroke: '#0f1117', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </TrendChartCard>
  );
}
