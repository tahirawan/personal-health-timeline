import { Download, FileJson, FileText, Upload } from 'lucide-react';
import { useState } from 'react';

import type { TimelineEvent } from '../../../shared/types/domain';
import type { ImportMode } from '../../../shared/types/storage';
import {
  exportBackupJson,
  exportBloodPressureCsv,
  parseBackupJson,
  toReadableImportError,
  type ImportPreview,
} from '../services/backupService';
import {
  parseManualTimelineText,
  type SmartTextImportResult,
} from '../services/smartTextImportService';

type BackupPanelProps = {
  events: TimelineEvent[];
  onImportEvents: (events: TimelineEvent[], mode: ImportMode) => Promise<void>;
};

export function BackupPanel({ events, onImportEvents }: BackupPanelProps) {
  const [jsonText, setJsonText] = useState('');
  const [jsonPreview, setJsonPreview] = useState<ImportPreview | undefined>();
  const [jsonError, setJsonError] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [smartText, setSmartText] = useState('');
  const [smartPreview, setSmartPreview] = useState<SmartTextImportResult | undefined>();
  const [status, setStatus] = useState('');

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function previewJson() {
    setJsonError('');
    setStatus('');

    try {
      setJsonPreview(parseBackupJson(jsonText));
    } catch (error) {
      setJsonPreview(undefined);
      setJsonError(toReadableImportError(error));
    }
  }

  async function importJson() {
    if (!jsonPreview) {
      return;
    }

    if (
      importMode === 'replace' &&
      !window.confirm('Replace all existing local timeline data with this backup?')
    ) {
      return;
    }

    await onImportEvents(jsonPreview.backup.events, importMode);
    setStatus(`Imported ${jsonPreview.totalEvents} events from JSON backup.`);
    setJsonPreview(undefined);
    setJsonText('');
  }

  function previewSmartText() {
    setStatus('');
    setSmartPreview(parseManualTimelineText(smartText));
  }

  async function importSmartText() {
    if (!smartPreview || smartPreview.events.length === 0) {
      return;
    }

    await onImportEvents(smartPreview.events, 'merge');
    setStatus(`Imported ${smartPreview.events.length} parsed timeline events.`);
    setSmartPreview(undefined);
    setSmartText('');
  }

  return (
    <section className="section-block" aria-labelledby="backup-heading">
      <h2 id="backup-heading">Backup & import</h2>

      <div className="action-grid">
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            download(
              'health-timeline-backup.json',
              exportBackupJson(events),
              'application/json;charset=utf-8',
            )
          }
        >
          <FileJson size={18} />
          Export JSON backup
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            download(
              'blood-pressure-readings.csv',
              exportBloodPressureCsv(events),
              'text/csv;charset=utf-8',
            )
          }
        >
          <Download size={18} />
          Export BP CSV
        </button>
      </div>

      <div className="import-panel">
        <h3>Import JSON backup</h3>
        <label>
          Paste backup JSON
          <textarea
            rows={6}
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            placeholder='{"version":1,"exportedAt":"...","events":[...]}'
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={importMode === 'replace'}
            onChange={(event) => setImportMode(event.target.checked ? 'replace' : 'merge')}
          />
          Replace existing local data after confirmation
        </label>
        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={previewJson}
            disabled={!jsonText.trim()}
          >
            <Upload size={18} />
            Preview JSON
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={importJson}
            disabled={!jsonPreview}
          >
            Import previewed backup
          </button>
        </div>
        {jsonError ? <p className="field-error">{jsonError}</p> : null}
        {jsonPreview ? (
          <p className="preview-note">
            Preview: {jsonPreview.totalEvents} events, {jsonPreview.bloodPressureCount} BP,{' '}
            {jsonPreview.mealCount} meals, {jsonPreview.tabletCount} tablets,{' '}
            {jsonPreview.noteCount} notes.
          </p>
        ) : null}
      </div>

      <div className="import-panel">
        <h3>Smart text import</h3>
        <label>
          Paste manual log text
          <textarea
            rows={8}
            value={smartText}
            onChange={(event) => setSmartText(event.target.value)}
            placeholder={`2026-04-29\n09:28 - 120/75 - 74 - After Breakfast\n09:23 - Breakfast - egg with avocado sandwich\n11:00 - Tablet`}
          />
        </label>
        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={previewSmartText}
            disabled={!smartText.trim()}
          >
            <FileText size={18} />
            Preview text
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={importSmartText}
            disabled={!smartPreview || smartPreview.events.length === 0}
          >
            Save parsed entries
          </button>
        </div>
        {smartPreview ? (
          <div className="preview-note">
            <p>
              Preview: {smartPreview.events.length} parsed events,{' '}
              {smartPreview.invalidLines.length} lines need review.
            </p>
            {smartPreview.invalidLines.length > 0 ? (
              <ul>
                {smartPreview.invalidLines.map((line) => (
                  <li key={`${line.lineNumber}-${line.text}`}>
                    Line {line.lineNumber}: {line.reason}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      {status ? <p className="success-note">{status}</p> : null}
    </section>
  );
}
