import AudioRecorder from "./components/AudioRecorder.tsx";
import SettingsButton from "./components/SettingsButton.tsx";
import { useState } from "react";

function App() {
  const [LowVol, setLowVol] = useState<number>(-50);
  const [MedVol, setMedVol] = useState<number>(-30);
  return (
    <div className='min-h-screen p-4 flex justify-between flex-col gap-4'>
      <label className='text-4xl'>VoiceVolume</label>

      <div className='flex justify-center gap-4'>
        <AudioRecorder lowVol={LowVol} midVol={MedVol} />
      </div>
      <SettingsButton
        values={{ lowVol: LowVol, medVol: MedVol }}
        onLowVolChange={(newLowVol) => {
          setLowVol(newLowVol);
        }}
        onMedVolChange={(newMedVol) => {
          setMedVol(newMedVol);
        }}
      />
      <label className='flex justify-center gap-1'>
        <span>Built by</span>
        <a
          className='text-blue-500 hover:text-blue-300'
          href='https://github.com/Marshy8'
          target='_blank'
          rel='noopener noreferrer'
        >
          Buck Harris
        </a>
        <span>&</span>
        <a
          className='text-blue-500 hover:text-blue-300'
          href='https://github.com/justunator'
          target='_blank'
          rel='noopener noreferrer'
        >
          Justin Quan
        </a>
      </label>
    </div>
  );
}

export default App;
