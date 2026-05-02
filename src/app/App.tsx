import {
  Activity,
  BarChart3,
  ChevronDown,
  Droplets,
  Home,
  Pill,
  Settings,
  StickyNote,
  Utensils,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import './App.css';
import { BackupPanel } from '../features/backup/components/BackupPanel';
import { getMergeableEvents } from '../features/backup/services/backupService';
import { AddBloodPressureForm } from '../features/blood-pressure/components/AddBloodPressureForm';
import { buildBloodPressureEvent } from '../features/blood-pressure/services/bloodPressureService';
import { AddBloodSugarForm } from '../features/blood-sugar/components/AddBloodSugarForm';
import { buildBloodSugarEvent } from '../features/blood-sugar/services/bloodSugarService';
import { AddMealForm } from '../features/meals/components/AddMealForm';
import { buildMealEvent } from '../features/meals/services/mealService';
import { BloodPressureLineChart } from '../features/reports/components/BloodPressureLineChart';
import { BloodSugarLineChart } from '../features/reports/components/BloodSugarLineChart';
import { ReportsPanel } from '../features/reports/components/ReportsPanel';
import {
  calculateBloodPressureSummary,
  calculateBloodSugarSummary,
  createBloodSugarChartPoints,
  createChartPoints,
  filterBloodPressureEvents,
  filterBloodSugarEvents,
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
  BloodSugarEvent,
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
type FormName = 'readingTypePicker' | 'bloodPressure' | 'bloodSugar' | 'meal' | 'tablet' | 'note';

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
  const [pickerFlow, setPickerFlow] = useState(false);
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

  const closeForm = () => {
    setActiveForm(undefined);
    setPickerFlow(false);
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

  const handleSaveBloodSugar = async (values: Parameters<typeof buildBloodSugarEvent>[0]) => {
    const existing = editingEvent?.type === 'bloodSugar' ? editingEvent : undefined;
    const event = buildBloodSugarEvent(values, existing);
    await (existing ? repository.putEvent(event) : repository.addEvent(event));
    await refreshAfterSave('Blood sugar reading saved.');
  };

  const handleSaveTablet = async (values: Parameters<typeof buildTabletEvent>[0]) => {
    const existing = editingEvent?.type === 'tablet' ? editingEvent : undefined;
    const event = buildTabletEvent(values, existing);
    await (existing ? repository.putEvent(event) : repository.addEvent(event));
    await refreshAfterSave('Medicine saved.');
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
              Blood pressure, blood sugar, meals, medicine, and notes stay on this device.
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
              events={events}
              todayEvents={todayEvents}
              onAdd={(formName) => {
                if (formName === 'readingTypePicker') setPickerFlow(true);
                setActiveForm(formName);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}
          {view === 'timeline' ? (
            <TimelineList
              events={events}
              title="Full timeline"
              emptyMessage="No timeline events yet. Add a reading, meal, medicine, or note."
              showFilters
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
              pickerFlow,
              onCancel: closeForm,
              onBackToPicker: () => setActiveForm('readingTypePicker'),
              onPickReading: (type) => setActiveForm(type),
              onSaveBloodPressure: handleSaveBloodPressure,
              onSaveBloodSugar: handleSaveBloodSugar,
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
  events,
  todayEvents,
  onAdd,
  onEdit,
  onDelete,
}: {
  events: TimelineEvent[];
  todayEvents: TimelineEvent[];
  onAdd: (formName: FormName) => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (event: TimelineEvent) => void;
}) {
  const [todayOnly, setTodayOnly] = useState(false);
  const [bpOpen, setBpOpen] = useState(true);
  const [sugarOpen, setSugarOpen] = useState(false);

  const periodEvents = useMemo(() => {
    if (todayOnly) return todayEvents;
    const range = getReportDateRange('7days');
    return filterEventsByRange(events, range);
  }, [todayOnly, todayEvents, events]);

  const bpReadings = useMemo(() => filterBloodPressureEvents(periodEvents), [periodEvents]);
  const sugarReadings = useMemo(() => filterBloodSugarEvents(periodEvents), [periodEvents]);
  const bpSummary = useMemo(() => calculateBloodPressureSummary(bpReadings), [bpReadings]);
  const sugarSummary = useMemo(() => calculateBloodSugarSummary(sugarReadings), [sugarReadings]);
  const bpChartPoints = useMemo(() => createChartPoints(bpReadings), [bpReadings]);
  const sugarChartPoints = useMemo(
    () => createBloodSugarChartPoints(sugarReadings),
    [sugarReadings],
  );

  const hasBpData = bpSummary.totalReadings > 0;
  const hasSugarData = sugarSummary.totalReadings > 0;
  const periodLabel = todayOnly ? 'Today' : 'Last 7 days';

  // Always compute today + 7-day summaries for accordion glance, independent of the toggle
  const sevenDayEvents = useMemo(() => {
    const range = getReportDateRange('7days');
    return filterEventsByRange(events, range);
  }, [events]);

  const todayBpSummary = useMemo(
    () => calculateBloodPressureSummary(filterBloodPressureEvents(todayEvents)),
    [todayEvents],
  );
  const sevenDayBpSummary = useMemo(
    () => calculateBloodPressureSummary(filterBloodPressureEvents(sevenDayEvents)),
    [sevenDayEvents],
  );
  const todaySugarSummary = useMemo(
    () => calculateBloodSugarSummary(filterBloodSugarEvents(todayEvents)),
    [todayEvents],
  );
  const sevenDaySugarSummary = useMemo(
    () => calculateBloodSugarSummary(filterBloodSugarEvents(sevenDayEvents)),
    [sevenDayEvents],
  );

  const bpClosedSummary = [
    todayBpSummary.totalReadings > 0
      ? `Today ${displayNumber(todayBpSummary.averageSystolic)}/${displayNumber(todayBpSummary.averageDiastolic)}`
      : 'Today –',
    sevenDayBpSummary.totalReadings > 0
      ? `7d avg ${displayNumber(sevenDayBpSummary.averageSystolic)}/${displayNumber(sevenDayBpSummary.averageDiastolic)}`
      : '7d avg –',
  ].join(' · ');

  const sugarClosedSummary = [
    todaySugarSummary.totalReadings > 0
      ? `Today ${displayNumber(todaySugarSummary.averageReading)} mg/dL`
      : 'Today –',
    sevenDaySugarSummary.totalReadings > 0
      ? `7d avg ${displayNumber(sevenDaySugarSummary.averageReading)} mg/dL`
      : '7d avg –',
  ].join(' · ');

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
            onClick={() => onAdd('readingTypePicker')}
          >
            <Activity className={ui.quickIcon} size={20} />
            Add Reading
          </button>
          <button className={ui.quickSecondaryButton} type="button" onClick={() => onAdd('meal')}>
            <Utensils className={ui.quickIcon} size={20} />
            Add Meal
          </button>
          <button className={ui.quickSecondaryButton} type="button" onClick={() => onAdd('tablet')}>
            <Pill className={ui.quickIcon} size={20} />
            Add Medicine
          </button>
          <button className={ui.quickSecondaryButton} type="button" onClick={() => onAdd('note')}>
            <StickyNote className={ui.quickIcon} size={20} />
            Add Note
          </button>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="trend-heading">
        <div className={ui.sectionHeadingRow}>
          <h2 className={ui.h2} id="trend-heading">
            Recent trend
          </h2>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-extrabold text-health-ink">
            Today only
            <span
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[rgb(19_139_131_/_30%)]',
                todayOnly ? 'bg-health-teal' : 'bg-[rgb(19_139_131_/_24%)]',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
                aria-label="Show today only"
              />
              <span
                className={cn(
                  'pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  todayOnly ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </span>
          </label>
        </div>

        <div className="grid gap-3">
          <AccordionPanel
            title="Blood Pressure"
            subtitle={periodLabel}
            closedSummary={bpClosedSummary}
            isOpen={bpOpen}
            onToggle={() => setBpOpen(!bpOpen)}
          >
            {hasBpData ? (
              <div className={ui.statsGridCompact}>
                <HomeMetricCard
                  label="Avg systolic"
                  value={displayNumber(bpSummary.averageSystolic)}
                />
                <HomeMetricCard
                  label="Avg diastolic"
                  value={displayNumber(bpSummary.averageDiastolic)}
                />
                <HomeMetricCard label="Avg pulse" value={displayNumber(bpSummary.averagePulse)} />
              </div>
            ) : (
              <p className={ui.emptyState}>No blood pressure readings in this period.</p>
            )}
            {bpChartPoints.length > 0 && (
              <BloodPressureLineChart points={bpChartPoints} compact testId="home-bp-chart" />
            )}
          </AccordionPanel>

          <AccordionPanel
            title="Blood Sugar"
            subtitle={periodLabel}
            closedSummary={sugarClosedSummary}
            isOpen={sugarOpen}
            onToggle={() => setSugarOpen(!sugarOpen)}
          >
            {hasSugarData ? (
              <div className={ui.statsGridCompact}>
                <HomeMetricCard
                  label="Avg reading"
                  value={`${displayNumber(sugarSummary.averageReading)} mg/dL`}
                />
                <HomeMetricCard
                  label="Highest"
                  value={`${displayNumber(sugarSummary.highestReading)} mg/dL`}
                />
                <HomeMetricCard
                  label="Lowest"
                  value={`${displayNumber(sugarSummary.lowestReading)} mg/dL`}
                />
              </div>
            ) : (
              <p className={ui.emptyState}>No blood sugar readings in this period.</p>
            )}
            {sugarChartPoints.length > 0 && (
              <BloodSugarLineChart points={sugarChartPoints} compact testId="home-sugar-chart" />
            )}
          </AccordionPanel>
        </div>
      </section>

      <TimelineList
        events={todayEvents}
        title="Today timeline"
        emptyMessage="No events logged today."
        showFilters
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}

function AccordionPanel({
  title,
  subtitle,
  closedSummary,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  closedSummary?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[rgb(19_139_131_/_16%)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 bg-[rgb(19_139_131_/_6%)] px-[18px] py-4 text-left font-extrabold text-health-ink"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-baseline gap-3">
            <span className="text-[1.05rem]">{title}</span>
            <span className="text-sm font-bold text-health-muted">{subtitle}</span>
          </div>
          {!isOpen && closedSummary && (
            <span className="text-sm font-normal text-health-muted">{closedSummary}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-health-muted transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && <div className="px-[18px] pb-4 pt-4">{children}</div>}
    </div>
  );
}

function HomeMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={ui.metricCard}>
      <span className={ui.metricLabel}>{label}</span>
      <strong className={ui.metricValue}>{value}</strong>
    </div>
  );
}

function getModalTitle(formName: FormName, editingEvent?: TimelineEvent): string {
  if (formName === 'readingTypePicker') return 'Add Reading';
  const action = editingEvent ? 'Edit' : 'Add';
  if (formName === 'bloodPressure') return `${action} BP reading`;
  if (formName === 'bloodSugar') return `${action} blood sugar`;
  if (formName === 'meal') return `${action} meal`;
  if (formName === 'tablet') return `${action} medicine`;
  return `${action} note`;
}

function renderActiveForm({
  activeForm,
  editingEvent,
  pickerFlow,
  onCancel,
  onBackToPicker,
  onPickReading,
  onSaveBloodPressure,
  onSaveBloodSugar,
  onSaveMeal,
  onSaveTablet,
  onSaveNote,
}: {
  activeForm: FormName;
  editingEvent?: TimelineEvent;
  pickerFlow: boolean;
  onCancel: () => void;
  onBackToPicker: () => void;
  onPickReading: (type: 'bloodPressure' | 'bloodSugar') => void;
  onSaveBloodPressure: (values: Parameters<typeof buildBloodPressureEvent>[0]) => Promise<void>;
  onSaveBloodSugar: (values: Parameters<typeof buildBloodSugarEvent>[0]) => Promise<void>;
  onSaveMeal: (values: Parameters<typeof buildMealEvent>[0]) => Promise<void>;
  onSaveTablet: (values: Parameters<typeof buildTabletEvent>[0]) => Promise<void>;
  onSaveNote: (values: Parameters<typeof buildNoteEvent>[0]) => Promise<void>;
}) {
  const formCancel = pickerFlow && !editingEvent ? onBackToPicker : onCancel;

  if (activeForm === 'readingTypePicker') {
    return <ReadingTypePicker onPick={onPickReading} onCancel={onCancel} />;
  }

  if (activeForm === 'bloodPressure') {
    return (
      <AddBloodPressureForm
        initialEvent={editingEvent as BloodPressureEvent | undefined}
        onCancel={formCancel}
        onSubmit={onSaveBloodPressure}
      />
    );
  }

  if (activeForm === 'bloodSugar') {
    return (
      <AddBloodSugarForm
        initialEvent={editingEvent as BloodSugarEvent | undefined}
        onCancel={formCancel}
        onSubmit={onSaveBloodSugar}
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

function ReadingTypePicker({
  onPick,
  onCancel,
}: {
  onPick: (type: 'bloodPressure' | 'bloodSugar') => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="m-0 text-sm text-health-muted">What type of reading would you like to add?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex flex-col items-center gap-3 rounded-[20px] border border-[rgb(19_139_131_/_16%)] bg-[linear-gradient(145deg,rgb(19_139_131_/_10%),rgb(255_255_255_/_62%))] px-4 py-6 font-extrabold text-health-ink transition-[transform,background-color] duration-150 hover:-translate-y-px"
          onClick={() => onPick('bloodPressure')}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-health-teal text-white">
            <Activity size={24} />
          </span>
          <span>Blood Pressure</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-3 rounded-[20px] border border-[rgb(19_139_131_/_16%)] bg-[linear-gradient(145deg,rgb(19_139_131_/_10%),rgb(255_255_255_/_62%))] px-4 py-6 font-extrabold text-health-ink transition-[transform,background-color] duration-150 hover:-translate-y-px"
          onClick={() => onPick('bloodSugar')}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d97706] text-white">
            <Droplets size={24} />
          </span>
          <span>Blood Sugar</span>
        </button>
      </div>
      <button type="button" className={ui.secondaryButton} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
