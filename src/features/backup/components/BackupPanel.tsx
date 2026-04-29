import { Download, FileJson, FileText, Upload } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';

import type { ToastTone } from '../../../shared/components/Toast';
import { ui } from '../../../shared/lib/uiStyles';
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
  onBackToReports?: () => void;
  onImportEvents: (events: TimelineEvent[], mode: ImportMode) => Promise<boolean>;
  onNotify?: (tone: ToastTone, title: string, description?: string) => void;
};

export function BackupPanel({
  events,
  onBackToReports,
  onImportEvents,
  onNotify = () => undefined,
}: BackupPanelProps) {
  const [jsonText, setJsonText] = useState('');
  const [jsonFileName, setJsonFileName] = useState('');
  const [jsonPreview, setJsonPreview] = useState<ImportPreview | undefined>();
  const [jsonError, setJsonError] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [smartText, setSmartText] = useState('');
  const [smartPreview, setSmartPreview] = useState<SmartTextImportResult | undefined>();

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

    try {
      const preview = parseBackupJson(jsonText);
      setJsonPreview(preview);
      onNotify('success', 'Backup preview ready.', `${preview.totalEvents} events found.`);
    } catch (error) {
      setJsonPreview(undefined);
      setJsonError(toReadableImportError(error));
      onNotify('error', 'Backup file is not valid.', toReadableImportError(error));
    }
  }

  async function importJson() {
    if (!jsonPreview) {
      return;
    }

    const imported = await onImportEvents(jsonPreview.backup.events, importMode);
    if (!imported) {
      return;
    }

    onNotify('success', 'JSON backup imported.', `${jsonPreview.totalEvents} events processed.`);
    setJsonPreview(undefined);
    setJsonText('');
    setJsonFileName('');
  }

  async function handleJsonFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setJsonFileName(file.name);
    setJsonError('');

    try {
      const text = await readFileText(file);
      setJsonText(text);
      const preview = parseBackupJson(text);
      setJsonPreview(preview);
      onNotify('success', 'Backup file loaded.', `${preview.totalEvents} events ready to review.`);
    } catch (error) {
      setJsonPreview(undefined);
      const message = toReadableImportError(error);
      setJsonError(message);
      onNotify('error', 'Backup file is not valid.', message);
    }
  }

  function previewSmartText() {
    const preview = parseManualTimelineText(smartText);
    setSmartPreview(preview);
    onNotify(
      preview.invalidLines.length > 0 ? 'info' : 'success',
      'Smart text preview ready.',
      `${preview.events.length} parsed events, ${preview.invalidLines.length} lines need review.`,
    );
  }

  async function importSmartText() {
    if (!smartPreview || smartPreview.events.length === 0) {
      return;
    }

    const imported = await onImportEvents(smartPreview.events, 'merge');
    if (!imported) {
      return;
    }

    onNotify(
      'success',
      'Smart text entries saved.',
      `${smartPreview.events.length} events imported.`,
    );
    setSmartPreview(undefined);
    setSmartText('');
  }

  return (
    <>
      <section className={ui.section} aria-labelledby="backup-heading">
        <div className={ui.sectionHeadingRow}>
          <div>
            <h2 className={ui.h2} id="backup-heading">
              Backup & import
            </h2>
            <p className={ui.sectionDescription}>
              Export files from this device or import a JSON backup after previewing it.
            </p>
          </div>
          {onBackToReports ? (
            <button className={ui.secondaryButton} type="button" onClick={onBackToReports}>
              Back to reports
            </button>
          ) : null}
        </div>
      </section>

      <section className={ui.section} aria-labelledby="export-heading">
        <h2 className={ui.h2} id="export-heading">
          Export files
        </h2>
        <div className={ui.actionGrid}>
          <button
            className={ui.quickSecondaryButton}
            type="button"
            onClick={() =>
              download(
                'health-timeline-backup.json',
                exportBackupJson(events),
                'application/json;charset=utf-8',
              )
            }
          >
            <FileJson className={ui.quickIcon} size={18} />
            Export JSON backup
          </button>
          <button
            className={ui.quickSecondaryButton}
            type="button"
            onClick={() =>
              download(
                'blood-pressure-readings.csv',
                exportBloodPressureCsv(events),
                'text/csv;charset=utf-8',
              )
            }
          >
            <Download className={ui.quickIcon} size={18} />
            Export BP CSV
          </button>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="json-import-heading">
        <h3 className={ui.h3} id="json-import-heading">
          Import JSON backup
        </h3>
        <label className={ui.label}>
          Choose backup JSON file
          <input
            className={ui.fileInput}
            type="file"
            accept="application/json,.json"
            onChange={handleJsonFileChange}
          />
          {jsonFileName ? (
            <span className={ui.fieldHelp}>Selected file: {jsonFileName}</span>
          ) : null}
        </label>
        <label className={ui.label}>
          Or paste backup JSON
          <textarea
            className={ui.textarea}
            rows={6}
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setJsonPreview(undefined);
              setJsonFileName('');
            }}
            placeholder='{"version":1,"exportedAt":"...","events":[...]}'
          />
        </label>
        <label className={ui.checkboxRow}>
          <input
            className={ui.checkboxInput}
            type="checkbox"
            checked={importMode === 'replace'}
            onChange={(event) => setImportMode(event.target.checked ? 'replace' : 'merge')}
          />
          Replace existing local data after confirmation
        </label>
        <div className={ui.formActions}>
          <button
            className={ui.secondaryButton}
            type="button"
            onClick={previewJson}
            disabled={!jsonText.trim()}
          >
            <Upload size={18} />
            Preview JSON
          </button>
          <button
            className={ui.primaryButton}
            type="button"
            onClick={importJson}
            disabled={!jsonPreview}
          >
            Import previewed backup
          </button>
        </div>
        {jsonError ? <p className={ui.fieldError}>{jsonError}</p> : null}
        {jsonPreview ? (
          <p className={ui.previewNote}>
            Preview: {jsonPreview.totalEvents} events, {jsonPreview.bloodPressureCount} BP,{' '}
            {jsonPreview.mealCount} meals, {jsonPreview.tabletCount} tablets,{' '}
            {jsonPreview.noteCount} notes.
          </p>
        ) : null}
      </section>

      <section className={ui.section} aria-labelledby="smart-import-heading">
        <h3 className={ui.h3} id="smart-import-heading">
          Smart text import
        </h3>
        <label className={ui.label}>
          Paste manual log text
          <textarea
            className={ui.textarea}
            rows={8}
            value={smartText}
            onChange={(event) => setSmartText(event.target.value)}
            placeholder={`2026-04-29\n09:28 - 120/75 - 74 - After Breakfast\n09:23 - Breakfast - egg with avocado sandwich\n11:00 - Tablet`}
          />
        </label>
        <div className={ui.formActions}>
          <button
            className={ui.secondaryButton}
            type="button"
            onClick={previewSmartText}
            disabled={!smartText.trim()}
          >
            <FileText size={18} />
            Preview text
          </button>
          <button
            className={ui.primaryButton}
            type="button"
            onClick={importSmartText}
            disabled={!smartPreview || smartPreview.events.length === 0}
          >
            Save parsed entries
          </button>
        </div>
        {smartPreview ? (
          <div className={ui.previewNote}>
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
      </section>
    </>
  );
}

function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Backup file could not be read.'));
    });

    reader.addEventListener('error', () => {
      reject(new Error('Backup file could not be read.'));
    });

    reader.readAsText(file);
  });
}
