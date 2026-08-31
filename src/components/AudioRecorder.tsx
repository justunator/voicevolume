import { useRef, useState } from "react";
import AnalyticsModel from "./AnalyticsModel.tsx";

interface AudioRecorderProps {
  onRecordingChange?: (recording: boolean) => void;
}

const SAMPLE_INTERVAL_MS = 500;

function AudioRecorder({ onRecordingChange }: AudioRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const audioContext = useRef<AudioContext | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const audioArray = useRef<number[]>([]);

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

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

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    mediaRecorder.current = new MediaRecorder(stream);

    audioContext.current = new AudioContext();
    const source = audioContext.current.createMediaStreamSource(stream);
    analyserNode.current = audioContext.current.createAnalyser();
    source.connect(analyserNode.current);
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

    mediaRecorder.current.start();
    onRecordingChange?.(true);
    setRecording(true);

    sampleAudioPeaks();
  }

  function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      onRecordingChange?.(false);
      setRecording(false);
    }
  }

  return (
    <div>
      <h2>Audio Recorder</h2>

      <button
        className={`text-black outline rounded-md p-4 disabled:opacity-50 ${
          recording
            ? "bg-red-500 hover:bg-red-300 disabled:hover:bg-red-500"
            : "bg-green-500 hover:bg-green-300 disabled:hover:bg-green-500"
        }`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop" : "Start"}
      </button>

      {audioURL && (
        <div>
          <h3>Your recording:</h3>

          <audio controls src={audioURL} />

          <br />

          <a href={audioURL} download="recording.webm">
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
