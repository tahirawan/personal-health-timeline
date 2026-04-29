import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { displayNumber } from '../../../shared/lib/numbers';
import type { TimelineEvent } from '../../../shared/types/domain';
import {
  calculateBloodPressureSummary,
  countTimelineEvents,
  createChartPoints,
  filterBloodPressureEvents,
  filterEventsByRange,
  getReportDateRange,
  type ReportPeriod,
} from '../services/reportService';
import {
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipWrapperStyle,
  getChartMetricLabel,
  sortChartTooltipItems,
} from './chartTooltip';

type ReportsPanelProps = {
  events: TimelineEvent[];
};

const periodOptions: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 days' },
  { value: '30days', label: '30 days' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'overall', label: 'Overall' },
  { value: 'custom', label: 'Custom' },
];

export function ReportsPanel({ events }: ReportsPanelProps) {
  const [period, setPeriod] = useState<ReportPeriod>('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const report = useMemo(() => {
    const range = getReportDateRange(period, new Date(), { startDate, endDate });
    const scopedEvents = filterEventsByRange(events, range);
    const readings = filterBloodPressureEvents(scopedEvents);
    return {
      summary: calculateBloodPressureSummary(readings),
      counts: countTimelineEvents(scopedEvents),
      chartPoints: createChartPoints(readings),
    };
  }, [endDate, events, period, startDate]);

  return (
    <section className="section-block" aria-labelledby="reports-heading">
      <div className="section-heading-row">
        <h2 id="reports-heading">Reports</h2>
        <label className="compact-field">
          Period
          <select
            aria-label="Report period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as ReportPeriod)}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {period === 'custom' ? (
        <div className="form-grid two-column">
          <label>
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <div className="stats-grid" aria-label="Blood pressure summary">
        <MetricCard label="Avg systolic" value={displayNumber(report.summary.averageSystolic)} />
        <MetricCard label="Avg diastolic" value={displayNumber(report.summary.averageDiastolic)} />
        <MetricCard label="Avg pulse" value={displayNumber(report.summary.averagePulse)} />
        <MetricCard
          label="Highest systolic"
          value={displayNumber(report.summary.highestSystolic)}
        />
        <MetricCard
          label="Highest diastolic"
          value={displayNumber(report.summary.highestDiastolic)}
        />
        <MetricCard label="Lowest systolic" value={displayNumber(report.summary.lowestSystolic)} />
        <MetricCard
          label="Lowest diastolic"
          value={displayNumber(report.summary.lowestDiastolic)}
        />
        <MetricCard label="Total readings" value={String(report.summary.totalReadings)} />
      </div>

      <div
        className="chart-panel"
        aria-label="Blood pressure trend chart"
        data-testid="report-chart"
      >
        {report.chartPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={report.chartPoints}
              margin={{ top: 10, right: 12, left: -12, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#ffffff26" />
              <XAxis
                dataKey="label"
                minTickGap={28}
                tick={{ fill: '#ffffffcc' }}
                stroke="#ffffff55"
              />
              <YAxis
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fill: '#ffffffcc' }}
                stroke="#ffffff55"
              />
              <Tooltip
                contentStyle={chartTooltipContentStyle}
                cursor={chartTooltipCursor}
                formatter={(value, name) => [value, getChartMetricLabel(name)]}
                itemSorter={sortChartTooltipItems}
                itemStyle={chartTooltipItemStyle}
                labelStyle={chartTooltipLabelStyle}
                wrapperStyle={chartTooltipWrapperStyle}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic"
                stroke="#dc2626"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pulse"
                name="Pulse"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">No blood pressure readings in this period.</p>
        )}
      </div>

      <div className="stats-grid compact" aria-label="Timeline counts">
        <MetricCard label="Readings logged" value={String(report.counts.readings)} />
        <MetricCard label="Meals logged" value={String(report.counts.meals)} />
        <MetricCard label="Tablets logged" value={String(report.counts.tablets)} />
        <MetricCard label="Notes logged" value={String(report.counts.notes)} />
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
