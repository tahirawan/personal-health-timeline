import {
  Activity,
  BarChart3,
  Download,
  Home,
  Pill,
  Settings,
  StickyNote,
  Utensils,
} from 'lucide-react';
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
import { Disclaimer } from '../shared/components/Disclaimer';
import { Modal } from '../shared/components/Modal';
import { toLocalDateKey } from '../shared/lib/date';
import { displayNumber } from '../shared/lib/numbers';
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
  { id: 'backup', label: 'Backup', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function App({ repository = timelineRepository }: AppProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [view, setView] = useState<ViewName>('home');
  const [activeForm, setActiveForm] = useState<FormName | undefined>();
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [persistentStorageGranted, setPersistentStorageGranted] = useState<boolean | undefined>();
  const [status, setStatus] = useState('');
  const [loadError, setLoadError] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      const storedEvents = await repository.listEvents();
      setEvents(sortTimelineEvents(storedEvents, 'desc'));
      setLoadError('');
    } catch {
      setLoadError('Could not load local timeline data.');
    }
  }, [repository]);

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
    setStatus(message);
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
    if (!window.confirm('Delete this timeline event?')) {
      return;
    }

    await repository.deleteEvent(event.id);
    await loadEvents();
    setStatus('Timeline event deleted.');
  };

  const handleImportEvents = async (incomingEvents: TimelineEvent[], mode: ImportMode) => {
    if (mode === 'replace') {
      await repository.replaceAll(incomingEvents);
      await refreshAfterImport(`Replaced local data with ${incomingEvents.length} events.`);
      return;
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
  };

  const refreshAfterImport = async (message: string) => {
    await loadEvents();
    setStatus(message);
  };

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <div className="app-shell">
        <header className="app-header panel hero">
          <div className="hero-copy">
            <p className="eyebrow">Local-first health log</p>
            <h1>Health Timeline</h1>
            <p className="hero-text">
              Blood pressure, meals, tablets, and notes stay on this device.
            </p>
          </div>

          <aside className="hero-side">
            <nav className="app-nav view-switch hero-switch" aria-label="Primary navigation">
              {viewItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={view === item.id ? 'nav-button active' : 'nav-button'}
                    onClick={() => setView(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </header>

        <main className="views">
          {loadError ? <p className="field-error">{loadError}</p> : null}
          {status ? <p className="success-note">{status}</p> : null}
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
          {view === 'reports' ? <ReportsPanel events={events} /> : null}
          {view === 'backup' ? (
            <BackupPanel events={events} onImportEvents={handleImportEvents} />
          ) : null}
          {view === 'settings' ? (
            <SettingsPanel persistentStorageGranted={persistentStorageGranted} />
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
      </div>
    </>
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
  return (
    <>
      <section className="section-block" aria-labelledby="quick-add-heading">
        <h2 id="quick-add-heading">Quick add</h2>
        <div className="quick-actions">
          <button className="primary-button" type="button" onClick={() => onAdd('bloodPressure')}>
            <Activity size={20} />
            Add BP Reading
          </button>
          <button className="secondary-button" type="button" onClick={() => onAdd('meal')}>
            <Utensils size={20} />
            Add Meal
          </button>
          <button className="secondary-button" type="button" onClick={() => onAdd('tablet')}>
            <Pill size={20} />
            Add Tablet
          </button>
          <button className="secondary-button" type="button" onClick={() => onAdd('note')}>
            <StickyNote size={20} />
            Add Note
          </button>
        </div>
      </section>

      <section className="section-block" aria-labelledby="today-summary-heading">
        <h2 id="today-summary-heading">Today summary</h2>
        <div className="stats-grid compact">
          <div className="metric-card">
            <span>Avg systolic</span>
            <strong>{displayNumber(todaySummary.averageSystolic)}</strong>
          </div>
          <div className="metric-card">
            <span>Avg diastolic</span>
            <strong>{displayNumber(todaySummary.averageDiastolic)}</strong>
          </div>
          <div className="metric-card">
            <span>Avg pulse</span>
            <strong>{displayNumber(todaySummary.averagePulse)}</strong>
          </div>
        </div>
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
    <section className="section-block" aria-labelledby="trend-heading">
      <h2 id="trend-heading">Recent trend</h2>
      <div className="chart-panel mini" data-testid="home-trend-chart">
        {chartPoints.length > 0 ? (
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
              <Tooltip />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#dc2626"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
              <Line type="monotone" dataKey="pulse" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">Add a BP reading to see the trend.</p>
        )}
      </div>
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
