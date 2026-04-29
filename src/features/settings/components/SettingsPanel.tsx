import { Disclaimer } from '../../../shared/components/Disclaimer';

type SettingsPanelProps = {
  persistentStorageGranted: boolean | undefined;
};

export function SettingsPanel({ persistentStorageGranted }: SettingsPanelProps) {
  return (
    <section className="section-block" aria-labelledby="settings-heading">
      <h2 id="settings-heading">Settings & privacy</h2>
      <div className="privacy-list">
        <p>All timeline data is stored locally in this browser using IndexedDB.</p>
        <p>No backend, accounts, cloud sync, analytics, or remote health-data storage is used.</p>
        <p>
          Persistent storage request:{' '}
          <strong>{persistentStorageGranted ? 'granted' : 'best effort or unsupported'}</strong>
        </p>
      </div>
      <Disclaimer />
    </section>
  );
}
