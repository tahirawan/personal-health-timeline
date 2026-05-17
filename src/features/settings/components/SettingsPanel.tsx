import { Disclaimer } from '../../../shared/components/Disclaimer';
import { cn } from '../../../shared/lib/classNames';
import { ui } from '../../../shared/lib/uiStyles';
import type { AppSettings, FeatureConfigKey } from '../../../shared/types/settings';

type SettingsPanelProps = {
  persistentStorageGranted: boolean | undefined;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onOpenBackup: () => void;
};

const featureOptions: Array<{
  key: FeatureConfigKey;
  title: string;
  description: string;
}> = [
  {
    key: 'bloodPressure',
    title: 'Blood pressure readings',
    description: 'Show BP add options and BP charts.',
  },
  {
    key: 'bloodSugar',
    title: 'Blood sugar readings',
    description: 'Show sugar add options and sugar charts.',
  },
  {
    key: 'meals',
    title: 'Meals',
    description: 'Show meal add options.',
  },
  {
    key: 'medicine',
    title: 'Medicine',
    description: 'Show medicine add options.',
  },
  {
    key: 'notes',
    title: 'Notes',
    description: 'Show note add options.',
  },
];

export function SettingsPanel({
  persistentStorageGranted,
  settings,
  onSettingsChange,
  onOpenBackup,
}: SettingsPanelProps) {
  const updateFeature = (key: FeatureConfigKey, enabled: boolean) => {
    onSettingsChange({
      ...settings,
      features: {
        ...settings.features,
        [key]: enabled,
      },
    });
  };

  return (
    <section className={ui.section} aria-labelledby="settings-heading">
      <h2 className={ui.h2} id="settings-heading">
        Settings & privacy
      </h2>
      <div className="mb-[18px] grid gap-3" aria-label="Visible features">
        {featureOptions.map((option) => (
          <FeatureToggle
            key={option.key}
            title={option.title}
            description={option.description}
            checked={settings.features[option.key]}
            onChange={(checked) => updateFeature(option.key, checked)}
          />
        ))}
      </div>
      <div className={ui.privacyList}>
        <p>All timeline data is stored locally in this browser using IndexedDB.</p>
        <p>No backend, accounts, cloud sync, analytics, or remote health-data storage is used.</p>
        <p>
          Persistent storage request:{' '}
          <strong>{persistentStorageGranted ? 'granted' : 'best effort or unsupported'}</strong>
        </p>
      </div>
      <div className={ui.linkPanel}>
        <div>
          <h3 className={ui.linkPanelTitle}>Backup and restore</h3>
          <p className={ui.linkPanelText}>
            Export a local backup, import a JSON file, or use smart text import.
          </p>
        </div>
        <button className={ui.secondaryButton} type="button" onClick={onOpenBackup}>
          Open backup page
        </button>
      </div>
      <Disclaimer />
    </section>
  );
}

function FeatureToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[18px] border border-[rgb(19_139_131_/_16%)] bg-[linear-gradient(145deg,rgb(19_139_131_/_8%),rgb(255_255_255_/_60%))] px-4 py-3">
      <span className="grid min-w-0 gap-1">
        <span className="font-extrabold text-health-ink">{title}</span>
        <span className="text-sm leading-5 text-health-muted">{description}</span>
      </span>
      <span
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[rgb(19_139_131_/_30%)]',
          checked ? 'bg-health-teal' : 'bg-[rgb(33_26_51_/_18%)]',
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </span>
    </label>
  );
}
