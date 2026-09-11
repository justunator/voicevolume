import { useCallback, useEffect, useRef, useState } from "react";

export const SAMPLE_INTERVAL_MS = 50;

const MIN_AMPLITUDE = 1e-5;

const SILENCE_FLOOR_DBFS = -65;

export interface AudioAnalyserOptions {
  windowMs: number;
}

export function toDbfs(amplitude: number): number {
  return 20 * Math.log10(Math.max(amplitude, MIN_AMPLITUDE));
}

function readFrameDbfs(
  analyser: AnalyserNode,
  buffer: Float32Array<ArrayBuffer>,
): number {
  analyser.getFloatTimeDomainData(buffer);

  let sumOfSquares = 0;
  for (const sample of buffer) {
    sumOfSquares += sample * sample;
  }

  return toDbfs(Math.sqrt(sumOfSquares / buffer.length));
}

function collapseWindow(readings: number[]): number {
  if (readings.length === 0) {
    return SILENCE_FLOOR_DBFS;
  }

  const sorted = [...readings].sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)];
}

function trimLeadingSilence(levels: number[]): number[] {
  const firstLoud = levels.findIndex((level) => level > SILENCE_FLOOR_DBFS);
  return firstLoud === -1 ? levels : levels.slice(firstLoud);
}

export function useAudioAnalyser({ windowMs }: AudioAnalyserOptions) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDbfs, setCurrentDbfs] = useState<number | null>(null);
  const [historyDbfs, setHistoryDbfs] = useState<number[]>([]);

  const options = useRef({ windowMs });
  useEffect(() => {
    options.current = { windowMs };
  }, [windowMs]);

  const collected = useRef<number[]>([]);

  const start = useCallback(() => {
    setError(null);
    setHistoryDbfs([]);
    collected.current = [];
    setRecording(true);
  }, []);

  const stop = useCallback(() => {
    setHistoryDbfs(trimLeadingSilence(collected.current));
    setCurrentDbfs(null);
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let stream: MediaStream | undefined;
    let context: AudioContext | undefined;

    async function run() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        if (!cancelled) {
          setError("Microphone access was denied or is unavailable.");
          setRecording(false);
        }
        return;
      }

      context = new AudioContext();
      await context.resume();

      if (cancelled) {
        return;
      }

      const analyser = context.createAnalyser();
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);

      let readings: number[] = [];
      let windowStart = performance.now();

      timer = setInterval(() => {
        readings.push(readFrameDbfs(analyser, buffer));

        const now = performance.now();
        if (now - windowStart < options.current.windowMs) {
          return;
        }

        const level = collapseWindow(readings);
        setCurrentDbfs(level);
        collected.current.push(level);

        readings = [];
        windowStart = now;
      }, SAMPLE_INTERVAL_MS);
    }

    void run();

    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
      if (context && context.state !== "closed") {
        void context.close();
      }
    };
  }, [recording]);

  return { recording, error, currentDbfs, historyDbfs, windowMs, start, stop };
}
