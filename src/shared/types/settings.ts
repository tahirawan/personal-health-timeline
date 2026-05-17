export type FeatureConfig = {
  bloodPressure: boolean;
  bloodSugar: boolean;
  meals: boolean;
  medicine: boolean;
  notes: boolean;
};

export type AppSettings = {
  version: 1;
  features: FeatureConfig;
};

export type FeatureConfigKey = keyof FeatureConfig;

export const defaultAppSettings: AppSettings = {
  version: 1,
  features: {
    bloodPressure: true,
    bloodSugar: true,
    meals: true,
    medicine: true,
    notes: true,
  },
};
