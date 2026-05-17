import { useEffect, useMemo, useState } from 'react';

import { cn } from '../../../shared/lib/classNames';
import { ui } from '../../../shared/lib/uiStyles';
import { displayNumber } from '../../../shared/lib/numbers';
import type { TimelineEvent } from '../../../shared/types/domain';
import type { AppSettings } from '../../../shared/types/settings';
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
  settings: AppSettings;
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

export function ReportsPanel({ events, settings, onOpenBackup }: ReportsPanelProps) {
  const [period, setPeriod] = useState<ReportPeriod>('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReportTypes, setSelectedReportTypes] = useState<ReportType[]>([
    'bloodPressure',
    'bloodSugar',
  ]);

  const enabledReportTypes = useMemo(() => {
    const enabled: ReportType[] = [];

    if (settings.features.bloodPressure) {
      enabled.push('bloodPressure');
    }

    if (settings.features.bloodSugar) {
      enabled.push('bloodSugar');
    }

    return enabled;
  }, [settings.features.bloodPressure, settings.features.bloodSugar]);

  useEffect(() => {
    setSelectedReportTypes((currentTypes) => {
      const enabledSelection = currentTypes.filter((type) => enabledReportTypes.includes(type));
      return enabledSelection.length > 0 ? enabledSelection : enabledReportTypes;
    });
  }, [enabledReportTypes]);

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
  const visibleReportTypes = selectedReportTypes.filter((type) =>
    enabledReportTypes.includes(type),
  );

  const toggleReportType = (type: ReportType) => {
    setSelectedReportTypes((currentTypes) =>
      currentTypes.includes(type)
        ? currentTypes.filter((currentType) => currentType !== type)
        : [...currentTypes, type],
    );
  };

  return (
    <section className={ui.section} aria-labelledby="reports-heading">
      <div className={ui.sectionHeadingRow}>
        <h2 className={ui.h2} id="reports-heading">
          Reports
        </h2>
        {enabledReportTypes.length > 0 && (
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

      {enabledReportTypes.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Report filters">
          {settings.features.bloodPressure ? (
            <button
              type="button"
              aria-pressed={selectedReportTypes.includes('bloodPressure')}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-bold transition-colors duration-150',
                selectedReportTypes.includes('bloodPressure')
                  ? 'border-health-teal bg-health-teal text-white'
                  : 'border-[rgb(19_139_131_/_20%)] bg-transparent text-health-muted hover:text-health-ink',
              )}
              onClick={() => toggleReportType('bloodPressure')}
            >
              Blood Pressure
            </button>
          ) : null}
          {settings.features.bloodSugar ? (
            <button
              type="button"
              aria-pressed={selectedReportTypes.includes('bloodSugar')}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-bold transition-colors duration-150',
                selectedReportTypes.includes('bloodSugar')
                  ? 'border-[#d97706] bg-[#d97706] text-white'
                  : 'border-[rgb(19_139_131_/_20%)] bg-transparent text-health-muted hover:text-health-ink',
              )}
              onClick={() => toggleReportType('bloodSugar')}
            >
              Blood Sugar
            </button>
          ) : null}
        </div>
      ) : (
        <p className={ui.emptyState}>Enable a reading type in settings to show reports.</p>
      )}

      {visibleReportTypes.length === 0 && enabledReportTypes.length > 0 ? (
        <p className={ui.emptyState}>Select at least one report filter.</p>
      ) : null}

      {visibleReportTypes.includes('bloodPressure') && (
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

      {visibleReportTypes.includes('bloodSugar') && (
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

      {hasAnyData && enabledReportTypes.length > 0 && (
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
