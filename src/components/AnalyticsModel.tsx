import { useEffect, useRef } from "react";

interface AnalyticsModelProps {
  open: boolean;
  peaks: number[];
  intervalMs: number;
  onClose: () => void;
}

const PLOT_HEIGHT = 96;
const MAX_LABELS = 6;

function AnalyticsModel({
  open,
  peaks,
  intervalMs,
  onClose,
}: AnalyticsModelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const maxPeak = Math.max(...peaks, 0.0001);
  const barWidth = peaks.length > 0 ? 100 / peaks.length : 0;

  const labelIndices =
    peaks.length <= MAX_LABELS
      ? peaks.map((_, index) => index)
      : Array.from({ length: MAX_LABELS }, (_, i) =>
          Math.round((i * (peaks.length - 1)) / (MAX_LABELS - 1)),
        );

  const yAxisTicks = [1, 0.75, 0.5, 0.25, 0].map((fraction) => {
    const ratio = fraction * maxPeak;
    const dbfs = 20 * Math.log10(Math.max(ratio, 0.00001));

    return {
      y: PLOT_HEIGHT - fraction * PLOT_HEIGHT,
      label: `${dbfs.toFixed(2)} dBFS`,
    };
  });

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-150 max-w-[90vw] rounded-lg p-6 backdrop:bg-black/50"
    >
      <h2 className="text-2xl mb-4">Recording Analytics</h2>

      {peaks.length === 0 ? (
        <p>No peak data recorded.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative h-96 w-14 shrink-0 text-xs text-gray-400">
              {yAxisTicks.map((tick, i) => (
                <span
                  key={i}
                  className="absolute right-1 -translate-y-1/2"
                  style={{ top: `${tick.y}%` }}
                >
                  {tick.label}
                </span>
              ))}
            </div>

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-96 flex-1"
            >
              {yAxisTicks.map((tick, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={tick.y}
                  x2={100}
                  y2={tick.y}
                  stroke="#64748b"
                  strokeOpacity={0.2}
                  strokeWidth={0.3}
                />
              ))}

              <line
                x1={0}
                y1={PLOT_HEIGHT}
                x2={100}
                y2={PLOT_HEIGHT}
                stroke="#64748b"
                strokeOpacity={0.3}
                strokeWidth={0.5}
              />

              {peaks.map((value, index) => {
                const height = (value / maxPeak) * PLOT_HEIGHT;
                const gap = barWidth * 0.15;

                return (
                  <rect
                    key={index}
                    x={index * barWidth + gap / 2}
                    y={PLOT_HEIGHT - height}
                    width={barWidth - gap}
                    height={height}
                    rx={1}
                    fill="#3b82f6"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between mt-1 pl-14 text-xs text-gray-400">
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

export default AnalyticsModel;
