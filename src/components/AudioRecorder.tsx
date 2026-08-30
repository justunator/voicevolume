import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface AudioRecorderHandle {
  start: () => void;
  stop: () => void;
}

interface AudioRecorderProps {
  onRecordingChange?: (recording: boolean) => void;
}

const AudioRecorder = forwardRef<AudioRecorderHandle, AudioRecorderProps>(
  function AudioRecorder({ onRecordingChange }, ref) {
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const [audioURL, setAudioURL] = useState<string | null>(null);

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
    }

    function stopRecording() {
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
        onRecordingChange?.(false);
      }
    }

    useImperativeHandle(ref, () => ({
      start: startRecording,
      stop: stopRecording,
    }));

    return (
      <div>
        <h2>Audio Recorder</h2>

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
  },
);

export default AudioRecorder;
