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
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { TrendDataPoint } from '@/types';
import { TrendChartCard } from './trend-chart-card';

const GRID = '#2a2d3a';
const AXIS = '#8b8fa3';
const SKY = '#0ea5e9';

function acrZoneLabel(acr: number): string {
  if (acr < 0.8) return 'Undertraining';
  if (acr <= 1.3) return 'Optimal';
  if (acr <= 1.5) return 'Caution';
  return 'Overreaching';
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const acr = payload[0].value;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{acr.toFixed(2)} — {acrZoneLabel(acr)}</p>
    </div>
  );
}

interface AcrChartProps {
  data: TrendDataPoint[];
}

export function AcrChart({ data }: AcrChartProps) {
  const chartData = data.map((d) => ({
    date: format(parseISO(d.weekEnd), 'MMM d'),
    acr: parseFloat(d.acr.toFixed(2)),
  }));

  const maxAcr = Math.max(...data.map((d) => d.acr), 1.6);
  const yMax = Math.ceil(maxAcr * 10) / 10 + 0.1;

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const trend = !last || !prev
    ? 'flat'
    : Math.abs(last.acr - 1.0) < Math.abs(prev.acr - 1.0) ? 'up' : 'down';
  const currentValue = last ? last.acr.toFixed(2) : undefined;

  return (
    <TrendChartCard title="Acute:Chronic Ratio" currentValue={currentValue} trend={trend as 'up' | 'down' | 'flat'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 30, left: -16, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />

          {/* Zone bands */}
          <ReferenceArea y1={0.8} y2={1.3} fill="#10b981" fillOpacity={0.08} />
          <ReferenceArea y1={1.3} y2={1.5} fill="#f59e0b" fillOpacity={0.1} />
          <ReferenceArea y1={1.5} y2={yMax} fill="#f43f5e" fillOpacity={0.08} />

          {/* Zone boundary lines */}
          <ReferenceLine y={0.8} stroke={GRID} strokeDasharray="3 3" />
          <ReferenceLine y={1.3} stroke={GRID} strokeDasharray="3 3" />
          <ReferenceLine y={1.5} stroke={GRID} strokeDasharray="3 3" />

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
            domain={[0, yMax]}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="acr"
            stroke={SKY}
            strokeWidth={2}
            dot={{ r: 3, fill: SKY, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: SKY, stroke: '#0f1117', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </TrendChartCard>
  );
}
