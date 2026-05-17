import { defaultAppSettings, type AppSettings, type FeatureConfig } from '../types/settings';

const settingsStorageKey = 'healthTimeline:appSettings';

export type SettingsRepository = {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
};

export class LocalStorageSettingsRepository implements SettingsRepository {
  getSettings(): Promise<AppSettings> {
    if (!canUseLocalStorage()) {
      return Promise.resolve(defaultAppSettings);
    }

    const storedSettings = window.localStorage.getItem(settingsStorageKey);

    if (!storedSettings) {
      return Promise.resolve(defaultAppSettings);
    }

    try {
      const parsedSettings: unknown = JSON.parse(storedSettings);
      return Promise.resolve(normalizeSettings(parsedSettings));
    } catch {
      return Promise.resolve(defaultAppSettings);
    }
  }

  saveSettings(settings: AppSettings): Promise<void> {
    if (!canUseLocalStorage()) {
      return Promise.resolve();
    }

    window.localStorage.setItem(settingsStorageKey, JSON.stringify(normalizeSettings(settings)));
    return Promise.resolve();
  }
}

export const settingsRepository = new LocalStorageSettingsRepository();

function normalizeSettings(value: unknown): AppSettings {
  if (!isObject(value)) {
    return defaultAppSettings;
  }

  const features = isObject(value.features) ? value.features : {};

  return {
    version: 1,
    features: {
      bloodPressure: getBoolean(features.bloodPressure, defaultAppSettings.features.bloodPressure),
      bloodSugar: getBoolean(features.bloodSugar, defaultAppSettings.features.bloodSugar),
      meals: getBoolean(features.meals, defaultAppSettings.features.meals),
      medicine: getBoolean(features.medicine, defaultAppSettings.features.medicine),
      notes: getBoolean(features.notes, defaultAppSettings.features.notes),
    } satisfies FeatureConfig,
  };
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}
