import { Disclaimer } from '../../../shared/components/Disclaimer';
import { ui } from '../../../shared/lib/uiStyles';

type SettingsPanelProps = {
  persistentStorageGranted: boolean | undefined;
  onOpenBackup: () => void;
};

export function SettingsPanel({ persistentStorageGranted, onOpenBackup }: SettingsPanelProps) {
  return (
    <section className={ui.section} aria-labelledby="settings-heading">
      <h2 className={ui.h2} id="settings-heading">
        Settings & privacy
      </h2>
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
