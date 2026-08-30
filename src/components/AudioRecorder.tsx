import { useRef, useState } from "react";

interface AudioRecorderProps {
  onRecordingChange?: (recording: boolean) => void;
}

function AudioRecorder({ onRecordingChange }: AudioRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

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

    mediaRecorder.current.start();
    onRecordingChange?.(true);
    setRecording(true);
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
    </div>
  );
}

export default AudioRecorder;
