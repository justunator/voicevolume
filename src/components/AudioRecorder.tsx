import { useRef, useState } from "react";

function AudioRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
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
    setRecording(true);
  }

  function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }

  return (
    <div>
      <h2>Audio Recorder</h2>

      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      {audioURL && (
        <div>
          <h3>Your recording:</h3>

          <audio controls src={audioURL} />

          <br />

          <a href={audioURL} download='recording.webm'>
            Download
          </a>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
