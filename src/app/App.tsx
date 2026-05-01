import { Activity, BarChart3, Home, Pill, Settings, StickyNote, Utensils } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import './App.css';
import { BackupPanel } from '../features/backup/components/BackupPanel';
import { getMergeableEvents } from '../features/backup/services/backupService';
import { AddBloodPressureForm } from '../features/blood-pressure/components/AddBloodPressureForm';
import { buildBloodPressureEvent } from '../features/blood-pressure/services/bloodPressureService';
import { AddMealForm } from '../features/meals/components/AddMealForm';
import { buildMealEvent } from '../features/meals/services/mealService';
import { ReportsPanel } from '../features/reports/components/ReportsPanel';
import {
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipWrapperStyle,
  getChartMetricLabel,
  sortChartTooltipItems,
} from '../features/reports/components/chartTooltip';
import {
  calculateBloodPressureSummary,
  createChartPoints,
  filterBloodPressureEvents,
  filterEventsByRange,
  getReportDateRange,
} from '../features/reports/services/reportService';
import { SettingsPanel } from '../features/settings/components/SettingsPanel';
import { AddTabletForm } from '../features/tablets/components/AddTabletForm';
import { buildTabletEvent } from '../features/tablets/services/tabletService';
import { AddNoteForm } from '../features/timeline/components/AddNoteForm';
import { TimelineList } from '../features/timeline/components/TimelineList';
import {
  filterEventsForLocalDate,
  sortTimelineEvents,
} from '../features/timeline/services/timelineService';
import { buildNoteEvent } from '../features/timeline/services/noteService';
import { ConfirmDialog, type ConfirmDialogState } from '../shared/components/ConfirmDialog';
import { Disclaimer } from '../shared/components/Disclaimer';
import { Modal } from '../shared/components/Modal';
import {
  ToastViewport,
  type ToastMessage,
  type ToastPosition,
  type ToastTone,
} from '../shared/components/Toast';
import { cn } from '../shared/lib/classNames';
import { toLocalDateKey } from '../shared/lib/date';
import { createId } from '../shared/lib/ids';
import { displayNumber } from '../shared/lib/numbers';
import { ui } from '../shared/lib/uiStyles';
import { requestPersistentStorage } from '../shared/storage/db';
import { timelineRepository, type TimelineRepository } from '../shared/storage/timelineRepository';
import type {
  BloodPressureEvent,
  MealEvent,
  NoteEvent,
  TabletEvent,
  TimelineEvent,
} from '../shared/types/domain';
import type { ImportMode } from '../shared/types/storage';

type AppProps = {
  repository?: TimelineRepository;
};

type ViewName = 'home' | 'timeline' | 'reports' | 'backup' | 'settings';
type FormName = 'bloodPressure' | 'meal' | 'tablet' | 'note';

const viewItems: Array<{ id: ViewName; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Today', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const toastPosition: ToastPosition = 'top-right';

export function App({ repository = timelineRepository }: AppProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [view, setView] = useState<ViewName>('home');
  const [activeForm, setActiveForm] = useState<FormName | undefined>();
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [persistentStorageGranted, setPersistentStorageGranted] = useState<boolean | undefined>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | undefined>();
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | undefined>();

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = createId();
      setToasts((currentToasts) => [...currentToasts, { id, tone, title, description }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const requestConfirmation = useCallback((state: ConfirmDialogState): Promise<boolean> => {
    setConfirmDialog(state);
    return new Promise((resolve) => {
      setConfirmResolver(() => resolve);
    });
  }, []);

  const closeConfirmation = (confirmed: boolean) => {
    confirmResolver?.(confirmed);
    setConfirmResolver(undefined);
    setConfirmDialog(undefined);
  };

  const loadEvents = useCallback(async () => {
    try {
      const storedEvents = await repository.listEvents();
      setEvents(sortTimelineEvents(storedEvents, 'desc'));
    } catch {
      showToast('error', 'Could not load local timeline data.');
    }
  }, [repository, showToast]);

  useEffect(() => {
    void loadEvents();
    void requestPersistentStorage().then(setPersistentStorageGranted);
  }, [loadEvents]);

  const todayEvents = useMemo(
    () => filterEventsForLocalDate(events, toLocalDateKey(new Date())),
    [events],
  );

  const todaySummary = useMemo(
    () => calculateBloodPressureSummary(filterBloodPressureEvents(todayEvents)),
    [todayEvents],
  );

  const recentReadings = useMemo(() => {
    const range = getReportDateRange('7days');
    return filterBloodPressureEvents(filterEventsByRange(events, range));
  }, [events]);

  const closeForm = () => {
    setActiveForm(undefined);
    setEditingEvent(undefined);
  };

  const refreshAfterSave = async (message: string) => {
    await loadEvents();
    showToast('success', message);
    closeForm();
  };

  const handleSaveBloodPressure = async (values: Parameters<typeof buildBloodPressureEvent>[0]) => {
    const existing = editingEvent?.type === 'bloodPressure' ? editingEvent : undefined;
    const event = buildBloodPressureEvent(values, existing);
    await (existing ? repository.putEvent(event) : repository.addEvent(event));
    await refreshAfterSave('Blood pressure reading saved.');
  };

  const handleSaveMeal = async (values: Parameters<typeof buildMealEvent>[0]) => {
    const existing = editingEvent?.type === 'meal' ? editingEvent : undefined;
    const event = buildMealEvent(values, existing);
    await (existing ? repository.putEvent(event) : repository.addEvent(event));
    await refreshAfterSave('Meal saved.');
  };

  const handleSaveTablet = async (values: Parameters<typeof buildTabletEvent>[0]) => {
    const existing = editingEvent?.type === 'tablet' ? editingEvent : undefined;
    const event = buildTabletEvent(values, existing);
    await (existing ? repository.putEvent(event) : repository.addEvent(event));
    await refreshAfterSave('Tablet event saved.');
  };

  const handleSaveNote = async (values: Parameters<typeof buildNoteEvent>[0]) => {
    const existing = editingEvent?.type === 'note' ? editingEvent : undefined;
    const event = buildNoteEvent(values, existing);
    await (existing ? repository.putEvent(event) : repository.addEvent(event));
    await refreshAfterSave('Note saved.');
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setActiveForm(event.type);
  };

  const handleDelete = async (event: TimelineEvent) => {
    const confirmed = await requestConfirmation({
      title: 'Delete timeline event?',
      description: 'This removes the event from this device. Export a backup first if you need it.',
      confirmLabel: 'Delete',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    await repository.deleteEvent(event.id);
    await loadEvents();
    showToast('success', 'Timeline event deleted.');
  };

  const handleImportEvents = async (
    incomingEvents: TimelineEvent[],
    mode: ImportMode,
  ): Promise<boolean> => {
    if (mode === 'replace') {
      const confirmed = await requestConfirmation({
        title: 'Replace all local data?',
        description:
          'This will remove the timeline currently stored on this device and replace it with the selected backup.',
        confirmLabel: 'Replace data',
        destructive: true,
      });

      if (!confirmed) {
        return false;
      }

      await repository.replaceAll(incomingEvents);
      await refreshAfterImport(`Replaced local data with ${incomingEvents.length} events.`);
      return true;
    }

    const mergeableEvents = getMergeableEvents(events, incomingEvents);
    if (mergeableEvents.length > 0) {
      await repository.addEvents(mergeableEvents);
    }
    await refreshAfterImport(
      `Merged ${mergeableEvents.length} events. Skipped ${
        incomingEvents.length - mergeableEvents.length
      } duplicate events.`,
    );
    return true;
  };

  const refreshAfterImport = async (message: string) => {
    await loadEvents();
    showToast('success', message);
  };

  const activeNavView = view === 'backup' ? 'reports' : view;

  return (
    <div className={ui.page}>
      <div className={ui.backdrop} aria-hidden="true" />
      <div className={ui.appShell}>
        <header className={ui.hero}>
          <div className={ui.heroCopy}>
            <p className={ui.eyebrow}>Personal health log</p>
            <h1 className={ui.h1}>Health Timeline</h1>
            <p className={ui.heroText}>
              Blood pressure, meals, tablets, and notes stay on this device.
            </p>
          </div>

          <aside className={ui.heroSide}>
            <nav className={ui.nav} aria-label="Primary navigation">
              {viewItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(ui.navButton, activeNavView === item.id && ui.navButtonActive)}
                    onClick={() => setView(item.id)}
                  >
                    <Icon className={ui.navButtonIcon} size={18} />
                    <span className={ui.navButtonLabel}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </header>

        <main className={ui.views}>
          {view === 'home' ? (
            <HomeView
              todayEvents={todayEvents}
              todaySummary={todaySummary}
              recentReadings={recentReadings}
              onAdd={setActiveForm}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}
          {view === 'timeline' ? (
            <TimelineList
              events={events}
              title="Full timeline"
              emptyMessage="No timeline events yet. Add a reading, meal, tablet, or note."
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}
          {view === 'reports' ? (
            <ReportsPanel events={events} onOpenBackup={() => setView('backup')} />
          ) : null}
          {view === 'backup' ? (
            <BackupPanel
              events={events}
              onBackToReports={() => setView('reports')}
              onImportEvents={handleImportEvents}
              onNotify={showToast}
            />
          ) : null}
          {view === 'settings' ? (
            <SettingsPanel
              persistentStorageGranted={persistentStorageGranted}
              onOpenBackup={() => setView('backup')}
            />
          ) : null}
        </main>

        <Disclaimer />
        {activeForm ? (
          <Modal title={getModalTitle(activeForm, editingEvent)} onClose={closeForm}>
            {renderActiveForm({
              activeForm,
              editingEvent,
              onCancel: closeForm,
              onSaveBloodPressure: handleSaveBloodPressure,
              onSaveMeal: handleSaveMeal,
              onSaveTablet: handleSaveTablet,
              onSaveNote: handleSaveNote,
            })}
          </Modal>
        ) : null}
        {confirmDialog ? (
          <ConfirmDialog
            {...confirmDialog}
            onCancel={() => closeConfirmation(false)}
            onConfirm={() => closeConfirmation(true)}
          />
        ) : null}
        <ToastViewport messages={toasts} position={toastPosition} onDismiss={dismissToast} />
      </div>
    </div>
  );
}

function HomeView({
  todayEvents,
  todaySummary,
  recentReadings,
  onAdd,
  onEdit,
  onDelete,
}: {
  todayEvents: TimelineEvent[];
  todaySummary: ReturnType<typeof calculateBloodPressureSummary>;
  recentReadings: BloodPressureEvent[];
  onAdd: (formName: FormName) => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (event: TimelineEvent) => void;
}) {
  const hasTodaySummary =
    todaySummary.averageSystolic || todaySummary.averageDiastolic || todaySummary.averagePulse;
  return (
    <>
      <section className={ui.section} aria-labelledby="quick-add-heading">
        <h2 className={ui.h2} id="quick-add-heading">
          Quick add
        </h2>
        <div className={ui.quickActions}>
          <button
            className={ui.quickPrimaryButton}
            type="button"
            onClick={() => onAdd('bloodPressure')}
          >
            <Activity className={ui.quickIcon} size={20} />
            Add BP Reading
          </button>
          <button className={ui.quickSecondaryButton} type="button" onClick={() => onAdd('meal')}>
            <Utensils className={ui.quickIcon} size={20} />
            Add Meal
          </button>
          <button className={ui.quickSecondaryButton} type="button" onClick={() => onAdd('tablet')}>
            <Pill className={ui.quickIcon} size={20} />
            Add Tablet
          </button>
          <button className={ui.quickSecondaryButton} type="button" onClick={() => onAdd('note')}>
            <StickyNote className={ui.quickIcon} size={20} />
            Add Note
          </button>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="today-summary-heading">
        <h2 className={ui.h2} id="today-summary-heading">
          Today summary
        </h2>
        {hasTodaySummary && (
          <div className={ui.statsGridCompact}>
            <div className={ui.metricCard}>
              <span className={ui.metricLabel}>Avg systolic</span>
              <strong className={ui.metricValue}>
                {displayNumber(todaySummary.averageSystolic)}
              </strong>
            </div>
            <div className={ui.metricCard}>
              <span className={ui.metricLabel}>Avg diastolic</span>
              <strong className={ui.metricValue}>
                {displayNumber(todaySummary.averageDiastolic)}
              </strong>
            </div>
            <div className={ui.metricCard}>
              <span className={ui.metricLabel}>Avg pulse</span>
              <strong className={ui.metricValue}>{displayNumber(todaySummary.averagePulse)}</strong>
            </div>
          </div>
        )}
        {!hasTodaySummary && (
          <p className={ui.emptyState}>No blood pressure readings logged today.</p>
        )}
      </section>

      <RecentTrendChart readings={recentReadings} />

      <TimelineList
        events={todayEvents}
        title="Today timeline"
        emptyMessage="No events logged today."
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}

function RecentTrendChart({ readings }: { readings: BloodPressureEvent[] }) {
  const chartPoints = createChartPoints(readings);

  return (
    <section className={ui.section} aria-labelledby="trend-heading">
      <h2 className={ui.h2} id="trend-heading">
        Recent trend
      </h2>
      {chartPoints.length > 0 ? (
        <div className={cn(ui.chartPanel, ui.miniChartPanel)} data-testid="home-trend-chart">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={chartPoints} margin={{ top: 8, right: 12, left: -16, bottom: 2 }}>
              <XAxis
                dataKey="label"
                minTickGap={32}
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
        </div>
      ) : (
        <p className={ui.emptyState}>No blood pressure readings in the last 7 days.</p>
      )}
    </section>
  );
}

function getModalTitle(formName: FormName, editingEvent?: TimelineEvent): string {
  const action = editingEvent ? 'Edit' : 'Add';
  if (formName === 'bloodPressure') {
    return `${action} BP reading`;
  }

  if (formName === 'meal') {
    return `${action} meal`;
  }

  if (formName === 'tablet') {
    return `${action} tablet`;
  }

  return `${action} note`;
}

function renderActiveForm({
  activeForm,
  editingEvent,
  onCancel,
  onSaveBloodPressure,
  onSaveMeal,
  onSaveTablet,
  onSaveNote,
}: {
  activeForm: FormName;
  editingEvent?: TimelineEvent;
  onCancel: () => void;
  onSaveBloodPressure: (values: Parameters<typeof buildBloodPressureEvent>[0]) => Promise<void>;
  onSaveMeal: (values: Parameters<typeof buildMealEvent>[0]) => Promise<void>;
  onSaveTablet: (values: Parameters<typeof buildTabletEvent>[0]) => Promise<void>;
  onSaveNote: (values: Parameters<typeof buildNoteEvent>[0]) => Promise<void>;
}) {
  if (activeForm === 'bloodPressure') {
    return (
      <AddBloodPressureForm
        initialEvent={editingEvent as BloodPressureEvent | undefined}
        onCancel={onCancel}
        onSubmit={onSaveBloodPressure}
      />
    );
  }

  if (activeForm === 'meal') {
    return (
      <AddMealForm
        initialEvent={editingEvent as MealEvent | undefined}
        onCancel={onCancel}
        onSubmit={onSaveMeal}
      />
    );
  }

  if (activeForm === 'tablet') {
    return (
      <AddTabletForm
        initialEvent={editingEvent as TabletEvent | undefined}
        onCancel={onCancel}
        onSubmit={onSaveTablet}
      />
    );
  }

  return (
    <AddNoteForm
      initialEvent={editingEvent as NoteEvent | undefined}
      onCancel={onCancel}
      onSubmit={onSaveNote}
    />
  );
}
