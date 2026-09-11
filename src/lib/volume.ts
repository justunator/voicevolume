export const DEFAULT_CALIBRATION_DB = 94;

export const MIN_DISPLAY_DB = 0;
export const MAX_DISPLAY_DB = 120;

export const MIN_CALIBRATION_DB = 0;
export const MAX_CALIBRATION_DB = 200;

export const MIN_ZONE_GAP_DB = 1;

export const MIN_UPDATE_INTERVAL_MS = 10;
export const MAX_UPDATE_INTERVAL_MS = 60000;

export const CHART_FLOOR_DB = 30;
export const CHART_CEILING_DB = 100;

export type VolumeZone = "low" | "medium" | "high";

export interface VolumeSettings {
  lowDb: number;
  medDb: number;
  updateIntervalMS: number;
  calibrationDb: number;
}

export const DEFAULT_SETTINGS: VolumeSettings = {
  lowDb: 44,
  medDb: 64,
  updateIntervalMS: 5000,
  calibrationDb: DEFAULT_CALIBRATION_DB,
};

export function toDisplayDb(dbfs: number, calibrationDb: number): number {
  return Math.max(MIN_DISPLAY_DB, dbfs + calibrationDb);
}

export function clampDisplayDb(value: number): number {
  return Math.min(MAX_DISPLAY_DB, Math.max(MIN_DISPLAY_DB, value));
}

export function volumeZone(
  db: number,
  lowDb: number,
  medDb: number,
): VolumeZone {
  if (db < lowDb) {
    return "low";
  }
  return db < medDb ? "medium" : "high";
}

export const ZONE_BG: Record<VolumeZone, string> = {
  low: "bg-green-400",
  medium: "bg-yellow-400",
  high: "bg-red-400",
};

export const ZONE_FILL: Record<VolumeZone, string> = {
  low: "#4ade80",
  medium: "#facc15",
  high: "#f87171",
};
