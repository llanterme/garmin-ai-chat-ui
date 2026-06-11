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
const AMBER = '#f59e0b';

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value}W</p>
    </div>
  );
}

interface FtpChartProps {
  data: TrendDataPoint[];
}

export function FtpChart({ data }: FtpChartProps) {
  const chartData = data
    .filter((d) => d.ftpWatts !== null)
    .map((d) => ({
      date: format(parseISO(d.weekEnd), 'MMM d'),
      ftp: d.ftpWatts as number,
    }));

  const nonNull = data.filter((d) => d.ftpWatts !== null);
  const first = nonNull[0];
  const last = nonNull[nonNull.length - 1];
  const trend = !first || !last || first === last
    ? 'flat'
    : last.ftpWatts! > first.ftpWatts! ? 'up' : 'down';
  const currentValue = last?.ftpWatts != null ? `${last.ftpWatts}W` : undefined;

  if (chartData.length === 0) {
    return (
      <TrendChartCard title="Cycling FTP">
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No FTP data available</p>
        </div>
      </TrendChartCard>
    );
  }

  const values = chartData.map((d) => d.ftp);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max((maxVal - minVal) * 0.2, 10);

  return (
    <TrendChartCard title="Cycling FTP" currentValue={currentValue} trend={trend as 'up' | 'down' | 'flat'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 30, left: -16, bottom: 5 }}>
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
            domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="ftp"
            stroke={AMBER}
            strokeWidth={2}
            connectNulls
            dot={{ r: 3, fill: AMBER, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: AMBER, stroke: '#0f1117', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </TrendChartCard>
  );
}
