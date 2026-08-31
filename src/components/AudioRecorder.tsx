import { useRef, useState } from "react";
import LiveAnalysis from "./LiveAnalysis";

interface AudioRecorderProps {
  onRecordingChange?: (recording: boolean) => void;
}

const sampleIntervalMS = 50;
const updateIntervalMS = 5000;

function AudioRecorder({ onRecordingChange }: AudioRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);

  const volumeData = useRef<Float32Array<ArrayBuffer> | null>(null);

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const dbReadings = useRef<number[]>([]);
  const [averageDbfs, setAverageDbfs] = useState<number | null>(null);
  const lastAverageTime = useRef<number | null>(null);

  function updateVolume() {
    console.log("Updating volume...");
    const now = Date.now();
    const analyserNode = analyser.current;
    const data = volumeData.current;
    if (!analyserNode || !data) {
      console.log("data or analyserNode is null");
      return;
    }

    analyserNode.getFloatTimeDomainData(data);

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
      Date.now() - lastAverageTime.current >= updateIntervalMS
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

      dbReadings.current = [];
      lastAverageTime.current = now;
    }
    if (mediaRecorder.current?.state === "recording") {
      setTimeout(updateVolume, sampleIntervalMS);
    }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    mediaRecorder.current = new MediaRecorder(stream);

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

      // stop microphone access
      stream.getTracks().forEach((track) => track.stop());
    };
    const context = new AudioContext();
    await context.resume();

    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048;

    const source = context.createMediaStreamSource(stream);
    source.connect(analyserNode);

    audioContext.current = context;
    analyser.current = analyserNode;

    volumeData.current = new Float32Array(analyserNode.fftSize);

    console.log("Starting recording...");
    mediaRecorder.current.start();
    onRecordingChange?.(true);
    setRecording(true);
    console.log(mediaRecorder.current.state);
    updateVolume();
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
      </div>
      <div>
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
      </div>
    </div>
  );
}

export default AudioRecorder;
