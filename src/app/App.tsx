import {
  Activity,
  BarChart3,
  ChevronDown,
  Droplets,
  Home,
  Pill,
  Plus,
  Settings,
  StickyNote,
  Utensils,
  X,
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
import { SummaryGroupCard } from '../shared/components/SummaryGroupCard';
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
import {
  settingsRepository as defaultSettingsRepository,
  type SettingsRepository,
} from '../shared/storage/settingsRepository';
import { timelineRepository, type TimelineRepository } from '../shared/storage/timelineRepository';
import type {
  BloodPressureEvent,
  BloodSugarEvent,
  MealEvent,
  NoteEvent,
  TabletEvent,
  TimelineEvent,
} from '../shared/types/domain';
import { defaultAppSettings, type AppSettings } from '../shared/types/settings';
import type { ImportMode } from '../shared/types/storage';

type AppProps = {
  repository?: TimelineRepository;
  settingsStore?: SettingsRepository;
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

export function App({
  repository = timelineRepository,
  settingsStore = defaultSettingsRepository,
}: AppProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
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

  useEffect(() => {
    void settingsStore.getSettings().then(setAppSettings);
  }, [settingsStore]);

  const handleSettingsChange = useCallback(
    (settings: AppSettings) => {
      setAppSettings(settings);
      void settingsStore.saveSettings(settings).catch(() => {
        showToast('error', 'Could not save local settings.');
      });
    },
    [settingsStore, showToast],
  );

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
              settings={appSettings}
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
              showRangeControls
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}
          {view === 'reports' ? (
            <ReportsPanel
              events={events}
              settings={appSettings}
              onOpenBackup={() => setView('backup')}
            />
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
              settings={appSettings}
              onSettingsChange={handleSettingsChange}
              onOpenBackup={() => setView('backup')}
            />
          ) : null}
        </main>

        <Disclaimer />
        {!activeForm && !confirmDialog ? (
          <FloatingAddButton
            settings={appSettings}
            onAdd={(formName) => {
              setPickerFlow(false);
              setActiveForm(formName);
            }}
          />
        ) : null}
        {activeForm ? (
          <Modal title={getModalTitle(activeForm, editingEvent)} onClose={closeForm}>
            {renderActiveForm({
              activeForm,
              editingEvent,
              pickerFlow,
              settings: appSettings,
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

type AddOption = {
  formName: Exclude<FormName, 'readingTypePicker'>;
  label: string;
  icon: typeof Activity;
  className: string;
};

function FloatingAddButton({
  settings,
  onAdd,
}: {
  settings: AppSettings;
  onAdd: (formName: Exclude<FormName, 'readingTypePicker'>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = getAddOptions(settings);

  const chooseOption = (formName: Exclude<FormName, 'readingTypePicker'>) => {
    onAdd(formName);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen ? (
        <button
          className="fixed inset-0 z-20 cursor-default bg-[rgb(6_21_28_/_24%)] backdrop-blur-[2px]"
          type="button"
          aria-label="Dismiss add menu"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <div className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+22px)] z-30 flex flex-col items-end gap-3 max-[420px]:right-4">
        {isOpen ? (
          <div
            className="grid gap-2 rounded-[24px] border border-white/40 bg-[linear-gradient(145deg,rgb(255_255_255_/_96%),rgb(235_248_244_/_90%))] p-2.5 shadow-health-panel backdrop-blur-[18px]"
            role="menu"
            aria-label="Add event options"
          >
            {options.length > 0 ? (
              options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.formName}
                    className="flex min-h-11 min-w-48 items-center justify-start gap-3 rounded-[18px] border border-[rgb(19_139_131_/_12%)] bg-white/70 px-3.5 py-2.5 text-left font-extrabold text-health-ink shadow-[0_10px_24px_rgb(6_21_28_/_8%)] transition-transform duration-150 hover:-translate-y-px focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(19_139_131_/_30%)]"
                    type="button"
                    role="menuitem"
                    onClick={() => chooseOption(option.formName)}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-full text-white',
                        option.className,
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="m-0 max-w-48 px-2 py-1 text-sm leading-5 text-health-muted">
                Enable an add option in settings.
              </p>
            )}
          </div>
        ) : null}
        <button
          className="grid h-14 w-14 place-items-center rounded-full border border-white/40 bg-[linear-gradient(135deg,var(--color-health-primary-strong),var(--color-health-teal))] text-white shadow-[0_18px_40px_rgb(6_21_28_/_34%)] transition-transform duration-150 hover:-translate-y-px focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(255_255_255_/_45%)] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          aria-label={isOpen ? 'Close add menu' : 'Open add menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X size={26} /> : <Plus size={28} />}
        </button>
      </div>
    </>
  );
}

function getAddOptions(settings: AppSettings): AddOption[] {
  const options: AddOption[] = [];

  if (settings.features.bloodPressure) {
    options.push({
      formName: 'bloodPressure',
      label: 'Blood Pressure',
      icon: Activity,
      className: 'bg-health-teal',
    });
  }

  if (settings.features.bloodSugar) {
    options.push({
      formName: 'bloodSugar',
      label: 'Blood Sugar',
      icon: Droplets,
      className: 'bg-[#d97706]',
    });
  }

  if (settings.features.meals) {
    options.push({
      formName: 'meal',
      label: 'Meal',
      icon: Utensils,
      className: 'bg-health-accent',
    });
  }

  if (settings.features.medicine) {
    options.push({
      formName: 'tablet',
      label: 'Medicine',
      icon: Pill,
      className: 'bg-[#2e6ecb]',
    });
  }

  if (settings.features.notes) {
    options.push({
      formName: 'note',
      label: 'Note',
      icon: StickyNote,
      className: 'bg-health-violet',
    });
  }

  return options;
}

function HomeView({
  events,
  todayEvents,
  settings,
  onEdit,
  onDelete,
}: {
  events: TimelineEvent[];
  todayEvents: TimelineEvent[];
  settings: AppSettings;
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
      <section className={ui.section} aria-labelledby="trend-heading">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-[1.15rem] font-bold" id="trend-heading">
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

        {settings.features.bloodPressure || settings.features.bloodSugar ? (
          <div className="grid gap-3">
            {settings.features.bloodPressure ? (
              <AccordionPanel
                title="Blood Pressure"
                subtitle={periodLabel}
                closedSummary={bpClosedSummary}
                isOpen={bpOpen}
                onToggle={() => setBpOpen(!bpOpen)}
              >
                {hasBpData ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <SummaryGroupCard
                      title="Average"
                      tone="teal"
                      items={[
                        { label: 'Systolic', value: displayNumber(bpSummary.averageSystolic) },
                        { label: 'Diastolic', value: displayNumber(bpSummary.averageDiastolic) },
                        { label: 'Pulse', value: displayNumber(bpSummary.averagePulse) },
                      ]}
                    />
                    <SummaryGroupCard
                      title="Highest"
                      tone="violet"
                      items={[
                        { label: 'Systolic', value: displayNumber(bpSummary.highestSystolic) },
                        { label: 'Diastolic', value: displayNumber(bpSummary.highestDiastolic) },
                        { label: 'Readings', value: String(bpSummary.totalReadings) },
                      ]}
                    />
                  </div>
                ) : (
                  <p className={ui.emptyState}>No blood pressure readings in this period.</p>
                )}
                {bpChartPoints.length > 0 && (
                  <BloodPressureLineChart points={bpChartPoints} compact testId="home-bp-chart" />
                )}
              </AccordionPanel>
            ) : null}

            {settings.features.bloodSugar ? (
              <AccordionPanel
                title="Blood Sugar"
                subtitle={periodLabel}
                closedSummary={sugarClosedSummary}
                isOpen={sugarOpen}
                onToggle={() => setSugarOpen(!sugarOpen)}
              >
                {hasSugarData ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <SummaryGroupCard
                      title="Average"
                      tone="orange"
                      items={[
                        {
                          label: 'Reading',
                          value: `${displayNumber(sugarSummary.averageReading)} mg/dL`,
                        },
                        { label: 'Readings', value: String(sugarSummary.totalReadings) },
                      ]}
                    />
                    <SummaryGroupCard
                      title="Highest"
                      tone="violet"
                      items={[
                        {
                          label: 'Reading',
                          value: `${displayNumber(sugarSummary.highestReading)} mg/dL`,
                        },
                        {
                          label: 'Lowest',
                          value: `${displayNumber(sugarSummary.lowestReading)} mg/dL`,
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <p className={ui.emptyState}>No blood sugar readings in this period.</p>
                )}
                {sugarChartPoints.length > 0 && (
                  <BloodSugarLineChart
                    points={sugarChartPoints}
                    compact
                    testId="home-sugar-chart"
                  />
                )}
              </AccordionPanel>
            ) : null}
          </div>
        ) : (
          <p className={ui.emptyState}>Enable a reading type in settings to show charts.</p>
        )}
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
  settings,
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
  settings: AppSettings;
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
    return <ReadingTypePicker settings={settings} onPick={onPickReading} onCancel={onCancel} />;
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
  settings,
  onPick,
  onCancel,
}: {
  settings: AppSettings;
  onPick: (type: 'bloodPressure' | 'bloodSugar') => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="m-0 text-sm text-health-muted">What type of reading would you like to add?</p>
      {settings.features.bloodPressure || settings.features.bloodSugar ? (
        <div className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
          {settings.features.bloodPressure ? (
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
          ) : null}
          {settings.features.bloodSugar ? (
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
          ) : null}
        </div>
      ) : (
        <p className={ui.emptyState}>No reading types are enabled in settings.</p>
      )}
      <button type="button" className={ui.secondaryButton} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
