import {
  CartesianGrid,
  Line,
  LineChart,
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

type BloodPressureLineChartProps = {
  points: ChartPoint[];
  compact?: boolean;
  testId?: string;
};

export function BloodPressureLineChart({
  points,
  compact = false,
  testId,
}: BloodPressureLineChartProps) {
  const chartHeight = compact ? 190 : 260;

  return (
    <div
      className={cn(ui.chartPanel, compact && ui.miniChartPanel)}
      aria-label="Blood pressure trend chart"
      data-testid={testId}
    >
      <ul className={ui.chartLegend} aria-label="Chart lines">
        {chartLineConfigs.map((line) => (
          <li className={ui.chartLegendItem} key={line.key}>
            <span className={line.legendClass} aria-hidden="true" />
            {line.label}
          </li>
        ))}
      </ul>
      <div className={ui.chartScrollArea}>
        <div
          className={cn(ui.chartCanvas, compact && ui.miniChartCanvas)}
          style={{ minWidth: getChartMinWidth(points.length) }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart
              data={points}
              margin={{ top: 8, right: 18, left: compact ? -8 : 0, bottom: 2 }}
            >
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
              <YAxis
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fill: '#ffffffcc', fontSize: 12, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                width={compact ? 34 : 40}
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
              {chartLineConfigs.map((line) => (
                <Line
                  connectNulls
                  dataKey={line.key}
                  dot={false}
                  key={line.key}
                  name={line.label}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function getChartMinWidth(pointCount: number): string {
  if (pointCount <= 4) {
    return '100%';
  }

  const width = Math.max(600, Math.min(1280, pointCount * 64));
  return `${width}px`;
}
