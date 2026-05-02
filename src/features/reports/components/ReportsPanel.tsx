import { useMemo, useState } from 'react';

import { cn } from '../../../shared/lib/classNames';
import { ui } from '../../../shared/lib/uiStyles';
import { displayNumber } from '../../../shared/lib/numbers';
import type { TimelineEvent } from '../../../shared/types/domain';
import {
  calculateBloodPressureSummary,
  calculateBloodSugarSummary,
  countTimelineEvents,
  createBloodSugarChartPoints,
  createChartPoints,
  filterBloodPressureEvents,
  filterBloodSugarEvents,
  filterEventsByRange,
  getReportDateRange,
  type ReportPeriod,
} from '../services/reportService';
import { BloodPressureLineChart } from './BloodPressureLineChart';
import { BloodSugarLineChart } from './BloodSugarLineChart';

type ReportsPanelProps = {
  events: TimelineEvent[];
  onOpenBackup: () => void;
};

type ReportType = 'bloodPressure' | 'bloodSugar';

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
  const [reportType, setReportType] = useState<ReportType>('bloodPressure');

  const report = useMemo(() => {
    const range = getReportDateRange(period, new Date(), { startDate, endDate });
    const scopedEvents = filterEventsByRange(events, range);
    const bpReadings = filterBloodPressureEvents(scopedEvents);
    const sugarReadings = filterBloodSugarEvents(scopedEvents);
    return {
      bpSummary: calculateBloodPressureSummary(bpReadings),
      sugarSummary: calculateBloodSugarSummary(sugarReadings),
      counts: countTimelineEvents(scopedEvents),
      bpChartPoints: createChartPoints(bpReadings),
      sugarChartPoints: createBloodSugarChartPoints(sugarReadings),
    };
  }, [endDate, events, period, startDate]);

  const hasBpData = report.bpSummary.totalReadings > 0;
  const hasSugarData = report.sugarSummary.totalReadings > 0;
  const hasAnyData = hasBpData || hasSugarData;

  return (
    <section className={ui.section} aria-labelledby="reports-heading">
      <div className={ui.sectionHeadingRow}>
        <h2 className={ui.h2} id="reports-heading">
          Reports
        </h2>
        {hasAnyData && (
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

      {hasAnyData && (
        <div className="mb-5 flex gap-2" role="tablist" aria-label="Report type">
          <button
            role="tab"
            type="button"
            aria-selected={reportType === 'bloodPressure'}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-bold transition-colors duration-150',
              reportType === 'bloodPressure'
                ? 'border-health-teal bg-health-teal text-white'
                : 'border-[rgb(19_139_131_/_20%)] bg-transparent text-health-muted hover:text-health-ink',
            )}
            onClick={() => setReportType('bloodPressure')}
          >
            Blood Pressure
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={reportType === 'bloodSugar'}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-bold transition-colors duration-150',
              reportType === 'bloodSugar'
                ? 'border-[#d97706] bg-[#d97706] text-white'
                : 'border-[rgb(19_139_131_/_20%)] bg-transparent text-health-muted hover:text-health-ink',
            )}
            onClick={() => setReportType('bloodSugar')}
          >
            Blood Sugar
          </button>
        </div>
      )}

      {reportType === 'bloodPressure' && (
        <>
          <div className={ui.statsGrid} aria-label="Blood pressure summary">
            {hasBpData ? (
              <>
                <MetricCard
                  label="Avg systolic"
                  value={displayNumber(report.bpSummary.averageSystolic)}
                />
                <MetricCard
                  label="Avg diastolic"
                  value={displayNumber(report.bpSummary.averageDiastolic)}
                />
                <MetricCard
                  label="Avg pulse"
                  value={displayNumber(report.bpSummary.averagePulse)}
                />
                <MetricCard
                  label="Highest systolic"
                  value={displayNumber(report.bpSummary.highestSystolic)}
                />
                <MetricCard
                  label="Highest diastolic"
                  value={displayNumber(report.bpSummary.highestDiastolic)}
                />
                <MetricCard
                  label="Lowest systolic"
                  value={displayNumber(report.bpSummary.lowestSystolic)}
                />
                <MetricCard
                  label="Lowest diastolic"
                  value={displayNumber(report.bpSummary.lowestDiastolic)}
                />
                <MetricCard label="Total readings" value={String(report.bpSummary.totalReadings)} />
              </>
            ) : (
              <p className={ui.emptyState}>No blood pressure readings in this period.</p>
            )}
          </div>
          {report.bpChartPoints.length > 0 && (
            <BloodPressureLineChart points={report.bpChartPoints} testId="report-chart" />
          )}
        </>
      )}

      {reportType === 'bloodSugar' && (
        <>
          <div className={ui.statsGrid} aria-label="Blood sugar summary">
            {hasSugarData ? (
              <>
                <MetricCard
                  label="Avg reading"
                  value={`${displayNumber(report.sugarSummary.averageReading)} mg/dL`}
                />
                <MetricCard
                  label="Highest"
                  value={`${displayNumber(report.sugarSummary.highestReading)} mg/dL`}
                />
                <MetricCard
                  label="Lowest"
                  value={`${displayNumber(report.sugarSummary.lowestReading)} mg/dL`}
                />
                <MetricCard
                  label="Total readings"
                  value={String(report.sugarSummary.totalReadings)}
                />
              </>
            ) : (
              <p className={ui.emptyState}>No blood sugar readings in this period.</p>
            )}
          </div>
          {report.sugarChartPoints.length > 0 && (
            <BloodSugarLineChart points={report.sugarChartPoints} testId="sugar-report-chart" />
          )}
        </>
      )}

      {hasAnyData && (
        <div className={ui.statsGridCompact} aria-label="Timeline counts">
          <MetricCard label="BP readings" value={String(report.counts.readings)} />
          <MetricCard label="Sugar readings" value={String(report.counts.bloodSugar)} />
          <MetricCard label="Meals" value={String(report.counts.meals)} />
          <MetricCard label="Medicine" value={String(report.counts.tablets)} />
          <MetricCard label="Notes" value={String(report.counts.notes)} />
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
