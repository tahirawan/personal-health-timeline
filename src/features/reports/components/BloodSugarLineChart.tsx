import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
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
import { cn } from '../../../shared/lib/classNames';
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
import { ChartModal } from './ChartModal';

type BloodSugarLineChartProps = {
  points: BloodSugarChartPoint[];
  compact?: boolean;
  allowExpand?: boolean;
  expandedView?: boolean;
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
  allowExpand = true,
  expandedView = false,
  testId,
}: BloodSugarLineChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const chartHeight = expandedView ? '100%' : compact ? 170 : 240;
  const axisHeight = expandedView ? '100%' : chartHeight;
  const chartScale = getChartScale(points);

  return (
    <>
      <div
        className={cn(
          ui.chartPanel,
          compact && ui.miniChartPanel,
          expandedView && 'm-0 grid h-full !min-h-0 grid-rows-[auto_minmax(0,1fr)]',
        )}
        aria-label="Blood sugar trend chart"
        data-testid={testId}
      >
        <div className="flex items-start justify-between gap-3">
          <ul className={ui.chartLegend} aria-label="Reference lines">
            <li className={ui.chartLegendItem}>
              <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" aria-hidden="true" />
              Blood Sugar
            </li>
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
          {allowExpand ? (
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-150 hover:bg-white/18 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(255_255_255_/_45%)]"
              type="button"
              aria-label="Expand blood sugar chart"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 size={18} />
            </button>
          ) : null}
        </div>
        <div className={cn(ui.chartScrollArea, expandedView && 'min-h-0')}>
          <div
            className={cn(ui.chartTrack, expandedView && 'h-full')}
            style={{ minWidth: getChartMinWidth(points.length) }}
          >
            <div
              className={ui.chartStickyAxis}
              style={{ height: axisHeight }}
              aria-label="Chart y-axis values"
            >
              <div className={ui.chartYAxisLabels}>
                {[...chartScale.ticks].reverse().map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            </div>
            <div
              className={cn(
                ui.chartCanvas,
                expandedView ? 'h-full' : compact && ui.miniChartCanvas,
              )}
            >
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={points} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgb(255 255 255 / 16%)" />
                  <XAxis
                    dataKey="timestamp"
                    interval="preserveStartEnd"
                    minTickGap={compact ? 42 : 50}
                    tick={{ fill: '#ffffffcc', fontSize: 12, fontWeight: 700 }}
                    tickFormatter={formatChartTick}
                    tickLine={false}
                    axisLine={false}
                    height={30}
                    tickMargin={6}
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
                    activeDot={{
                      fill: '#d97706',
                      r: compact ? 5 : 6,
                      stroke: '#ffffff',
                      strokeWidth: 2,
                    }}
                    connectNulls
                    dataKey="reading"
                    dot={{
                      fill: '#d97706',
                      r: compact ? 3 : 3.5,
                      stroke: '#ffffff',
                      strokeWidth: 2,
                    }}
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
      {isExpanded ? (
        <ChartModal
          ariaLabel="Expanded blood sugar chart"
          closeLabel="Close expanded blood sugar chart"
          onClose={() => setIsExpanded(false)}
          title="Blood sugar chart"
        >
          <BloodSugarLineChart
            allowExpand={false}
            expandedView
            points={points}
            testId={testId ? `${testId}-expanded` : undefined}
          />
        </ChartModal>
      ) : null}
    </>
  );
}

function getChartScale(points: BloodSugarChartPoint[]): {
  domain: [number, number];
  ticks: number[];
} {
  const allValues = [...points.map((p) => p.reading), ...referenceLines.map((r) => r.y)];

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
