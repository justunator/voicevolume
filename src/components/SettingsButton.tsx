import { useState } from "react";
import {
  DEFAULT_SETTINGS,
  MAX_CALIBRATION_DB,
  MAX_DISPLAY_DB,
  MAX_UPDATE_INTERVAL_MS,
  MIN_CALIBRATION_DB,
  MIN_DISPLAY_DB,
  MIN_UPDATE_INTERVAL_MS,
  MIN_ZONE_GAP_DB,
  clampDisplayDb,
  type VolumeSettings,
} from "../lib/volume.ts";

interface SettingsButtonProps {
  values: VolumeSettings;
  onChange: (values: VolumeSettings) => void;
}

type FieldName = keyof VolumeSettings;

type Drafts = Record<FieldName, string>;

function toDrafts(values: VolumeSettings): Drafts {
  return {
    lowDb: String(values.lowDb),
    medDb: String(values.medDb),
    updateIntervalMS: String(values.updateIntervalMS),
    calibrationDb: String(values.calibrationDb),
  };
}

function commitField(
  field: FieldName,
  raw: string,
  current: VolumeSettings,
): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);

  switch (field) {
    case "lowDb":
      return Math.min(clampDisplayDb(rounded), current.medDb - MIN_ZONE_GAP_DB);

    case "medDb":
      return Math.max(clampDisplayDb(rounded), current.lowDb + MIN_ZONE_GAP_DB);

    case "updateIntervalMS":
      return Math.min(
        MAX_UPDATE_INTERVAL_MS,
        Math.max(MIN_UPDATE_INTERVAL_MS, rounded),
      );

    case "calibrationDb":
      return Math.min(
        MAX_CALIBRATION_DB,
        Math.max(MIN_CALIBRATION_DB, rounded),
      );
  }
}

interface NumberFieldProps {
  label: string;
  hint: string;
  value: string;
  onDraftChange: (raw: string) => void;
  onCommit: () => void;
}

function NumberField({
  label,
  hint,
  value,
  onDraftChange,
  onCommit,
}: NumberFieldProps) {
  const [hintVisible, setHintVisible] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm">
        <input
          className="rounded-lg w-20 border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:ring-blue-500"
          type="number"
          value={value}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
        />

        <label className="flex-1 text-left">{label}</label>

        <button
          type="button"
          aria-label={`Explain ${label}`}
          aria-expanded={hintVisible}
          className="outline rounded-md px-2 text-black bg-blue-500 hover:bg-blue-300"
          onClick={() => setHintVisible((previous) => !previous)}
        >
          ?
        </button>
      </div>

      {hintVisible ? (
        <p className="text-left text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export default function SettingsButton({
  values,
  onChange,
}: SettingsButtonProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [drafts, setDrafts] = useState<Drafts>(() => toDrafts(values));
  const [lastValues, setLastValues] = useState(values);

  if (values !== lastValues) {
    setLastValues(values);
    setDrafts(toDrafts(values));
  }

  function commit(field: FieldName) {
    const accepted = commitField(field, drafts[field], values);

    if (accepted === null) {
      setDrafts((previous) => ({
        ...previous,
        [field]: String(values[field]),
      }));
      return;
    }

    onChange({ ...values, [field]: accepted });
  }

  function draftSetter(field: FieldName) {
    return (raw: string) =>
      setDrafts((previous) => ({ ...previous, [field]: raw }));
  }

  return (
    <div>
      <button
        type="button"
        aria-label={isSettingsOpen ? "Close settings" : "Open settings"}
        aria-expanded={isSettingsOpen}
        aria-controls="settings-panel"
        onClick={() => setIsSettingsOpen(true)}
        className="inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <aside
            id="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Settings</h2>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <NumberField
                label="Quiet up to (dB)"
                hint={`Volumes below this show green. Roughly ${MIN_DISPLAY_DB}-${MAX_DISPLAY_DB}; a quiet room is near 40 dB.`}
                value={drafts.lowDb}
                onDraftChange={draftSetter("lowDb")}
                onCommit={() => commit("lowDb")}
              />

              <NumberField
                label="Medium up to (dB)"
                hint="Volumes below this show yellow and above it show red. Conversation is near 60 dB, a shout near 85 dB."
                value={drafts.medDb}
                onDraftChange={draftSetter("medDb")}
                onCommit={() => commit("medDb")}
              />

              <NumberField
                label="Update interval (ms)"
                hint="How long volume is averaged before the live reading updates."
                value={drafts.updateIntervalMS}
                onDraftChange={draftSetter("updateIntervalMS")}
                onCommit={() => commit("updateIntervalMS")}
              />

              <NumberField
                label="Microphone calibration (dB)"
                hint="Browsers cannot measure true sound pressure, so readings are estimated. If a known sound reads too low, raise this; too high, lower it."
                value={drafts.calibrationDb}
                onDraftChange={draftSetter("calibrationDb")}
                onCommit={() => commit("calibrationDb")}
              />

              <button
                type="button"
                className="outline rounded-md p-2 text-black bg-blue-500 hover:bg-blue-300"
                onClick={() => onChange(DEFAULT_SETTINGS)}
              >
                Reset to Defaults
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
