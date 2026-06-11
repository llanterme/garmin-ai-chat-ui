'use client';

import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
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
const EMERALD = '#10b981';

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{Math.round(payload[0].value)} load</p>
    </div>
  );
}

interface TrainingLoadChartProps {
  data: TrendDataPoint[];
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
  const chartData = data.map((d) => ({
    date: format(parseISO(d.weekEnd), 'MMM d'),
    load: Math.round(d.totalLoad),
  }));

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const trend = !last || !prev ? 'flat' : last.totalLoad > prev.totalLoad ? 'up' : last.totalLoad < prev.totalLoad ? 'down' : 'flat';
  const currentValue = last ? `${Math.round(last.totalLoad)}` : undefined;

  return (
    <TrendChartCard title="Training Load" currentValue={currentValue} trend={trend as 'up' | 'down' | 'flat'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 30, left: -16, bottom: 5 }}>
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
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="load"
            stroke={EMERALD}
            strokeWidth={2}
            fill={EMERALD}
            fillOpacity={0.15}
            dot={false}
            activeDot={{ r: 4, fill: EMERALD, stroke: '#0f1117', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </TrendChartCard>
  );
}
