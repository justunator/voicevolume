import { useRef, useState } from "react";
import LiveAnalysis from "./LiveAnalysis";
import AnalyticsModel from "./AnalyticsModel.tsx";

interface AudioRecorderProps {
  onRecordingChange?: (recording: boolean) => void;
}

const LiveSampleIntervalMS = 50;
const updateIntervalMS = 5000;
const SAMPLE_INTERVAL_MS = 500;

function AudioRecorder({ onRecordingChange }: AudioRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const audioContext = useRef<AudioContext | null>(null);
  const volumeData = useRef<Float32Array<ArrayBuffer> | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const audioArray = useRef<number[]>([]);

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const dbReadings = useRef<number[]>([]);
  const [averageDbfs, setAverageDbfs] = useState<number | null>(null);
  const lastAverageTime = useRef<number | null>(null);

  function sampleAudioPeaks() {
    if (analyserNode.current === null) {
      return;
    }

    const uInt8Array = new Uint8Array(analyserNode.current.fftSize);

    analyserNode.current.getByteTimeDomainData(uInt8Array);

    const maxDistance = uInt8Array.reduce((max, sample) => {
      const distance = Math.abs(sample - 128);
      return Math.max(max, distance);
    }, 0);

    audioArray.current.push(maxDistance / 128);

    if (mediaRecorder.current?.state === "recording") {
      setTimeout(sampleAudioPeaks, SAMPLE_INTERVAL_MS);
    }
  }

  function updateVolume() {
    console.log("Updating volume...");
    const now = Date.now();
    const analyser = analyserNode.current;
    const data = volumeData.current;
    if (!analyser || !data) {
      console.log("data or analyser is null");
      return;
    }

    analyser.getFloatTimeDomainData(data);

    let sum = 0;

    for (const value of data) {
      sum += value * value;
    }

    const rms = Math.sqrt(sum / data.length);

    // Convert amplitude to dBFS, [-100, 0] range, where 0 is LOUD.
    // i have no idea why their scales are like this
    const dbfs = 20 * Math.log10(Math.max(rms, 0.00001));

    dbReadings.current.push(dbfs);
    if (
      // If its been 5 seconds do average the data and clear dbReadings
      lastAverageTime.current === null ||
      now - lastAverageTime.current >= updateIntervalMS
    ) {
      const readings = dbReadings.current;
      if (readings.length > 0) {
        setAverageDbfs(
          readings.reduce((total, value) => total + value, 0) / readings.length,
        );
        if (averageDbfs != null) {
          console.log(`5-second average: ${averageDbfs.toFixed(1)} dBFS`);
        }
      }
      console.log(dbReadings.current);
      dbReadings.current = [];
      lastAverageTime.current = now;
    }
    if (mediaRecorder.current?.state === "recording") {
      setTimeout(updateVolume, LiveSampleIntervalMS);
    }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    mediaRecorder.current = new MediaRecorder(stream);
    audioContext.current = new AudioContext();

    const source = audioContext.current.createMediaStreamSource(stream);
    analyserNode.current = audioContext.current.createAnalyser();
    source.connect(analyserNode.current);
    volumeData.current = new Float32Array(analyserNode.current.fftSize);

    audioArray.current = [];
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, {
        type: "audio/webm",
      });

      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);

      setPeaks(audioArray.current);
      setShowAnalytics(true);

      // stop microphone access
      stream.getTracks().forEach((track) => track.stop());
    };

    console.log("Starting recording...");
    mediaRecorder.current.start();
    onRecordingChange?.(true);
    setRecording(true);
    updateVolume();
    sampleAudioPeaks();
  }

  function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      onRecordingChange?.(false);
      setRecording(false);
      setAverageDbfs(null);
      console.log("Recording stopped.");
    }
  }

  return (
    <div>
      <div>
        {averageDbfs === null ? (
          <LiveAnalysis AverageDbfs={1} />
        ) : (
          <LiveAnalysis AverageDbfs={averageDbfs} />
        )}
      </div>
      <h2>Audio Recorder</h2>

      <button
        className={`text-black outline rounded-md p-4 disabled:opacity-50 ${
          recording
            ? "bg-red-500 hover:bg-red-300"
            : "bg-green-500 hover:bg-green-300"
        }`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop" : "Start"}
      </button>

      <br />

      <button
        className='text-black outline rounded-md p-4 mt-2 bg-blue-500 hover:bg-blue-300'
        onClick={() => setShowAnalytics(true)}
      >
        Show Analytics
      </button>

      {audioURL && (
        <div>
          <h3>Your recording:</h3>

          <audio className='inline' controls src={audioURL} />

          <br />

          <a href={audioURL} download='recording.webm'>
            Download
          </a>
        </div>
      )}

      <AnalyticsModel
        open={showAnalytics}
        peaks={peaks}
        intervalMs={SAMPLE_INTERVAL_MS}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  );
}

export default AudioRecorder;
