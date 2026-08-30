import { useRef, useState } from "react";
import AudioRecorder, {
  type AudioRecorderHandle,
} from "./components/AudioRecorder.tsx";

function App() {
  const recorderRef = useRef<AudioRecorderHandle>(null);
  const [recording, setRecording] = useState(false);

  return (
    <div className="min-h-screen p-4 flex justify-between flex-col gap-4">
      <label className="text-4xl">VoiceVolume</label>

      <div className="flex justify-center gap-4">
        <a className="box-border rounded-lg size-128 border-4 p-4"></a>
      </div>

      <div className="flex justify-center gap-4">
        {" "}
        {!recording ? (
          <button
            className="text-black outline rounded-md bg-green-500 hover:bg-green-300 disabled:opacity-50 disabled:hover:bg-green-500 p-4"
            onClick={() => recorderRef.current?.start()}
          >
            {" "}
            Start{" "}
          </button>
        ) : (
          <button
            className="text-black outline rounded-md bg-red-500 hover:bg-red-300 disabled:opacity-50 disabled:hover:bg-red-500 p-4"
            onClick={() => recorderRef.current?.stop()}
          >
            {" "}
            Stop{" "}
          </button>
        )}{" "}
      </div>

      <div className="flex justify-center gap-4">
        <AudioRecorder ref={recorderRef} onRecordingChange={setRecording} />
      </div>

      <label className="flex justify-center gap-1">
        <span>Built by</span>
        <a
          className="text-blue-500 hover:text-blue-300"
          href="https://github.com/Marshy8"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buck Harris
        </a>
        <span>&</span>
        <a
          className="text-blue-500 hover:text-blue-300"
          href="https://github.com/justunator"
          target="_blank"
          rel="noopener noreferrer"
        >
          Justin Quan
        </a>
      </label>
    </div>
  );
}

export default App;
