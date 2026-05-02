import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ui } from '../../../shared/lib/uiStyles';
import type { BloodSugarChartPoint } from '../services/reportService';
import {
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipWrapperStyle,
  formatChartTick,
  formatChartTooltipLabel,
} from './chartTooltip';

type BloodSugarLineChartProps = {
  points: BloodSugarChartPoint[];
  compact?: boolean;
  testId?: string;
};

const referenceLines = [
  { y: 70, label: '70 Low', stroke: '#38bdf8' },
  { y: 100, label: '100 Pre-diabetic', stroke: '#f59e0b' },
  { y: 126, label: '126 Diabetic', stroke: '#ef4444' },
  { y: 140, label: '140 Post-meal limit', stroke: '#f97316' },
];

export function BloodSugarLineChart({
  points,
  compact = false,
  testId,
}: BloodSugarLineChartProps) {
  const chartHeight = compact ? 190 : 260;
  const chartScale = getChartScale(points);

  return (
    <div
      className={ui.chartPanel}
      aria-label="Blood sugar trend chart"
      data-testid={testId}
    >
      <ul className={ui.chartLegend} aria-label="Reference lines">
        {referenceLines.map((ref) => (
          <li className={ui.chartLegendItem} key={ref.y}>
            <span
              className="inline-block h-0.5 w-4"
              style={{ background: ref.stroke }}
              aria-hidden="true"
            />
            {ref.label}
          </li>
        ))}
      </ul>
      <div className={ui.chartScrollArea}>
        <div className={ui.chartTrack} style={{ minWidth: getChartMinWidth(points.length) }}>
          <div
            className={ui.chartStickyAxis}
            style={{ height: chartHeight }}
            aria-label="Chart y-axis values"
          >
            <div className={ui.chartYAxisLabels}>
              {[...chartScale.ticks].reverse().map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
          </div>
          <div className={ui.chartCanvas}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={points} margin={{ top: 8, right: 18, left: 0, bottom: 2 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgb(255 255 255 / 16%)" />
                <XAxis
                  dataKey="timestamp"
                  interval="preserveStartEnd"
                  minTickGap={compact ? 42 : 50}
                  tick={{ fill: '#ffffffcc', fontSize: 12, fontWeight: 700 }}
                  tickFormatter={formatChartTick}
                  tickLine={false}
                  axisLine={false}
                  height={38}
                  tickMargin={10}
                />
                <YAxis domain={chartScale.domain} hide ticks={chartScale.ticks} />
                <Tooltip
                  contentStyle={chartTooltipContentStyle}
                  cursor={chartTooltipCursor}
                  formatter={(value) => [`${String(value)} mg/dL`, 'Blood Sugar']}
                  itemStyle={chartTooltipItemStyle}
                  labelFormatter={formatChartTooltipLabel}
                  labelStyle={chartTooltipLabelStyle}
                  wrapperStyle={chartTooltipWrapperStyle}
                />
                {referenceLines.map((ref) => (
                  <ReferenceLine
                    key={ref.y}
                    y={ref.y}
                    stroke={ref.stroke}
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                  />
                ))}
                <Line
                  activeDot={{ fill: '#d97706', r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                  connectNulls
                  dataKey="reading"
                  dot={{ fill: '#d97706', r: 3.5, stroke: '#ffffff', strokeWidth: 2 }}
                  name="Blood Sugar"
                  stroke="#d97706"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function getChartScale(points: BloodSugarChartPoint[]): { domain: [number, number]; ticks: number[] } {
  const allValues = [
    ...points.map((p) => p.reading),
    ...referenceLines.map((r) => r.y),
  ];

  if (allValues.length === 0) {
    return { domain: [0, 200], ticks: [0, 50, 100, 150, 200] };
  }

  const low = Math.min(...allValues);
  const high = Math.max(...allValues);
  const paddedLow = Math.max(0, low - 15);
  const paddedHigh = high + 15;
  const step = getNiceStep((paddedHigh - paddedLow) / 4);
  const min = Math.max(0, Math.floor(paddedLow / step) * step);
  const max = Math.ceil(paddedHigh / step) * step;
  const ticks: number[] = [];

  for (let tick = min; tick <= max + step / 2; tick += step) {
    ticks.push(Math.round(tick));
  }

  return { domain: [min, max], ticks };
}

function getNiceStep(rawStep: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function getChartMinWidth(pointCount: number): string {
  if (pointCount <= 4) return '100%';
  return `${Math.max(600, Math.min(1280, pointCount * 64))}px`;
}
