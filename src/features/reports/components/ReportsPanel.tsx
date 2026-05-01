import { useMemo, useState } from 'react';

import { ui } from '../../../shared/lib/uiStyles';
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
import { BloodPressureLineChart } from './BloodPressureLineChart';

type ReportsPanelProps = {
  events: TimelineEvent[];
  onOpenBackup: () => void;
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

export function ReportsPanel({ events, onOpenBackup }: ReportsPanelProps) {
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

  const hasReportSummary =
    report.summary.averageSystolic ||
    report.summary.averageDiastolic ||
    report.summary.averagePulse;

  return (
    <section className={ui.section} aria-labelledby="reports-heading">
      <div className={ui.sectionHeadingRow}>
        <h2 className={ui.h2} id="reports-heading">
          Reports
        </h2>
        {hasReportSummary && (
          <label className={ui.compactField}>
            Period
            <select
              className={ui.input}
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
        )}
      </div>

      {period === 'custom' ? (
        <div className={ui.formGridTwoColumn}>
          <label className={ui.label}>
            Start date
            <input
              className={ui.input}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className={ui.label}>
            End date
            <input
              className={ui.input}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <div className={ui.statsGrid} aria-label="Blood pressure summary">
        {hasReportSummary ? (
          <>
            <MetricCard
              label="Avg systolic"
              value={displayNumber(report.summary.averageSystolic)}
            />
            <MetricCard
              label="Avg diastolic"
              value={displayNumber(report.summary.averageDiastolic)}
            />
            <MetricCard label="Avg pulse" value={displayNumber(report.summary.averagePulse)} />
            <MetricCard
              label="Highest systolic"
              value={displayNumber(report.summary.highestSystolic)}
            />
            <MetricCard
              label="Highest diastolic"
              value={displayNumber(report.summary.highestDiastolic)}
            />
            <MetricCard
              label="Lowest systolic"
              value={displayNumber(report.summary.lowestSystolic)}
            />
            <MetricCard
              label="Lowest diastolic"
              value={displayNumber(report.summary.lowestDiastolic)}
            />
            <MetricCard label="Total readings" value={String(report.summary.totalReadings)} />
          </>
        ) : (
          <p className={ui.emptyState}>No blood pressure readings in this period.</p>
        )}
      </div>

      {report.chartPoints.length > 0 && (
        <BloodPressureLineChart points={report.chartPoints} testId="report-chart" />
      )}

      {hasReportSummary && (
        <div className={ui.statsGridCompact} aria-label="Timeline counts">
          <MetricCard label="Readings logged" value={String(report.counts.readings)} />
          <MetricCard label="Meals logged" value={String(report.counts.meals)} />
          <MetricCard label="Tablets logged" value={String(report.counts.tablets)} />
          <MetricCard label="Notes logged" value={String(report.counts.notes)} />
        </div>
      )}

      <div className={ui.linkPanel}>
        <div>
          <h3 className={ui.linkPanelTitle}>Export, import, and backup</h3>
          <p className={ui.linkPanelText}>
            Open the backup page to export JSON/CSV files or restore data from a backup.
          </p>
        </div>
        <button className={ui.secondaryButton} type="button" onClick={onOpenBackup}>
          Open backup page
        </button>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={ui.metricCard}>
      <span className={ui.metricLabel}>{label}</span>
      <strong className={ui.metricValue}>{value}</strong>
    </div>
  );
}
