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

import { cn } from '../../../shared/lib/classNames';
import { ui } from '../../../shared/lib/uiStyles';
import type { ChartPoint } from '../services/reportService';
import {
  chartLineConfigs,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipWrapperStyle,
  formatChartTick,
  formatChartTooltipLabel,
  getChartMetricLabel,
  sortChartTooltipItems,
} from './chartTooltip';
import { ChartModal } from './ChartModal';
import { useChartHeight, useRotatedMobileChart } from './useChartHeight';

const bpReferenceLines = [
  { y: 120, label: '120 systolic guide', stroke: '#f97316' },
  { y: 80, label: '80 diastolic guide', stroke: '#22c55e' },
];

type BloodPressureLineChartProps = {
  points: ChartPoint[];
  compact?: boolean;
  allowExpand?: boolean;
  expandedView?: boolean;
  testId?: string;
};

export function BloodPressureLineChart({
  points,
  compact = false,
  allowExpand = true,
  expandedView = false,
  testId,
}: BloodPressureLineChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const chartHeight = useChartHeight({ compact, expandedView });
  const rotateMobileChart = useRotatedMobileChart(expandedView);
  const chartScale = getChartScale(points);
  const visibleLineConfigs = chartLineConfigs.filter(
    (line) => line.key !== 'pulse' || points.some((point) => typeof point.pulse === 'number'),
  );

  return (
    <>
      <div
        className={cn(
          ui.chartPanel,
          compact && ui.miniChartPanel,
          expandedView && 'm-0 grid !min-h-0 grid-rows-[auto_minmax(0,1fr)]',
        )}
        aria-label="Blood pressure trend chart"
        data-testid={testId}
      >
        <div className="flex items-start justify-between gap-3">
          <ul className={ui.chartLegend} aria-label="Chart lines">
            {visibleLineConfigs.map((line) => (
              <li className={ui.chartLegendItem} key={line.key}>
                <span className={line.legendClass} aria-hidden="true" />
                {line.label}
              </li>
            ))}
            {bpReferenceLines.map((ref) => (
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
              aria-label="Expand blood pressure chart"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 size={18} />
            </button>
          ) : null}
        </div>
        <div className={ui.chartScrollArea}>
          <div
            className={ui.chartTrack}
            style={{ minWidth: getChartMinWidth(points.length, rotateMobileChart) }}
          >
            <div className={ui.chartCanvas} style={{ height: chartHeight }}>
              <ResponsiveContainer
                width="100%"
                height={chartHeight}
                minWidth={320}
                minHeight={chartHeight}
              >
                <LineChart data={points} margin={{ top: 14, right: 18, left: 2, bottom: 2 }}>
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
                  <YAxis
                    axisLine={false}
                    domain={chartScale.domain}
                    tick={{ fill: '#eaf6f4', fontSize: 11, fontWeight: 800 }}
                    tickLine={false}
                    tickMargin={6}
                    ticks={chartScale.ticks}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={chartTooltipContentStyle}
                    cursor={chartTooltipCursor}
                    formatter={(value, name) => [value, getChartMetricLabel(name)]}
                    itemSorter={sortChartTooltipItems}
                    itemStyle={chartTooltipItemStyle}
                    labelFormatter={formatChartTooltipLabel}
                    labelStyle={chartTooltipLabelStyle}
                    wrapperStyle={chartTooltipWrapperStyle}
                  />
                  {bpReferenceLines.map((ref) => (
                    <ReferenceLine
                      key={ref.y}
                      y={ref.y}
                      stroke={ref.stroke}
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                    />
                  ))}
                  {visibleLineConfigs.map((line) => (
                    <Line
                      activeDot={{
                        fill: line.stroke,
                        r: compact ? 5 : 6,
                        stroke: '#ffffff',
                        strokeWidth: 2,
                      }}
                      connectNulls
                      dataKey={line.key}
                      dot={
                        points.length > 24
                          ? false
                          : {
                              fill: line.stroke,
                              r: compact ? 3 : 3.5,
                              stroke: '#ffffff',
                              strokeWidth: 2,
                            }
                      }
                      isAnimationActive={false}
                      key={line.key}
                      name={line.label}
                      stroke={line.stroke}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={line.strokeWidth}
                      type="monotone"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {isExpanded ? (
        <ChartModal
          ariaLabel="Expanded blood pressure chart"
          closeLabel="Close expanded blood pressure chart"
          onClose={() => setIsExpanded(false)}
          title="Blood pressure chart"
        >
          <BloodPressureLineChart
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

type ChartScale = {
  domain: [number, number];
  ticks: number[];
};

function getChartScale(points: ChartPoint[]): ChartScale {
  const values = [
    ...points.flatMap((point) => [point.systolic, point.diastolic, point.pulse].filter(isNumber)),
    // Always include reference line values so they're visible
    ...bpReferenceLines.map((r) => r.y),
  ];

  if (values.length === 0) {
    return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };
  }

  const low = Math.min(...values);
  const high = Math.max(...values);
  const paddedLow = Math.max(0, low - 10);
  const paddedHigh = high + 10;
  const rawStep = (paddedHigh - paddedLow || 40) / 4;
  const step = getNiceStep(rawStep);
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

  if (normalized <= 1) {
    return magnitude;
  }

  if (normalized <= 2) {
    return 2 * magnitude;
  }

  if (normalized <= 2.5) {
    return 2.5 * magnitude;
  }

  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number';
}

function getChartMinWidth(pointCount: number, fitContainer: boolean): string {
  if (fitContainer || pointCount <= 4) {
    return '100%';
  }

  const width = Math.max(600, Math.min(1280, pointCount * 64));
  return `${width}px`;
}
