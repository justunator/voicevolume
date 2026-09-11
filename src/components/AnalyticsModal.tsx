import { useEffect, useRef } from "react";
import {
  CHART_CEILING_DB,
  CHART_FLOOR_DB,
  ZONE_FILL,
  toDisplayDb,
  volumeZone,
} from "../lib/volume.ts";

interface AnalyticsModalProps {
  open: boolean;
  historyDbfs: number[];
  intervalMs: number;
  calibrationDb: number;
  lowDb: number;
  medDb: number;
  onClose: () => void;
}

const PLOT_HEIGHT = 96;
const MAX_LABELS = 6;
const TICK_STEP_DB = 10;

function dbToY(db: number): number {
  const span = CHART_CEILING_DB - CHART_FLOOR_DB;
  const fraction = (db - CHART_FLOOR_DB) / span;
  return PLOT_HEIGHT - Math.min(1, Math.max(0, fraction)) * PLOT_HEIGHT;
}

function AnalyticsModal({
  open,
  historyDbfs,
  intervalMs,
  calibrationDb,
  lowDb,
  medDb,
  onClose,
}: AnalyticsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const levels = historyDbfs.map((dbfs) => toDisplayDb(dbfs, calibrationDb));
  const barWidth = levels.length > 0 ? 100 / levels.length : 0;

  const ticks: number[] = [];
  for (let db = CHART_CEILING_DB; db >= CHART_FLOOR_DB; db -= TICK_STEP_DB) {
    ticks.push(db);
  }

  const labelIndices =
    levels.length <= MAX_LABELS
      ? levels.map((_, index) => index)
      : Array.from({ length: MAX_LABELS }, (_, i) =>
          Math.round((i * (levels.length - 1)) / (MAX_LABELS - 1)),
        );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-150 max-w-[90vw] rounded-lg p-6 backdrop:bg-black/50"
    >
      <h2 className="text-2xl mb-4">Recording Analytics</h2>

      {levels.length === 0 ? (
        <p>No volume data recorded.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative h-96 w-12 shrink-0 text-xs text-gray-400">
              {ticks.map((db) => (
                <span
                  key={db}
                  className="absolute right-1 -translate-y-1/2"
                  style={{ top: `${dbToY(db)}%` }}
                >
                  {db} dB
                </span>
              ))}
            </div>

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-96 flex-1"
            >
              {ticks.map((db) => (
                <line
                  key={db}
                  x1={0}
                  y1={dbToY(db)}
                  x2={100}
                  y2={dbToY(db)}
                  stroke="#64748b"
                  strokeOpacity={0.2}
                  strokeWidth={0.3}
                />
              ))}

              {levels.map((db, index) => {
                const y = dbToY(db);
                const gap = barWidth * 0.15;

                return (
                  <rect
                    key={index}
                    x={index * barWidth + gap / 2}
                    y={y}
                    width={barWidth - gap}
                    height={PLOT_HEIGHT - y}
                    rx={1}
                    fill={ZONE_FILL[volumeZone(db, lowDb, medDb)]}
                  />
                );
              })}

              {[lowDb, medDb].map((threshold) => (
                <line
                  key={threshold}
                  x1={0}
                  y1={dbToY(threshold)}
                  x2={100}
                  y2={dbToY(threshold)}
                  stroke="#64748b"
                  strokeDasharray="2 2"
                  strokeWidth={0.5}
                />
              ))}
            </svg>
          </div>

          <div className="flex justify-between mt-1 pl-12 text-xs text-gray-400">
            {labelIndices.map((index) => (
              <span key={index}>
                {((index * intervalMs) / 1000).toFixed(1)}s
              </span>
            ))}
          </div>
        </>
      )}

      <button
        className="text-black outline rounded-md bg-red-500 hover:bg-red-300 p-4 mt-4"
        onClick={onClose}
      >
        Close
      </button>
    </dialog>
  );
}

export default AnalyticsModal;
