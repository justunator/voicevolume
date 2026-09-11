import { useState } from "react";

interface SettingsButtonProps {
  values: { lowVol: number; medVol: number; intervalMS: number };
  onLowVolChange: (lowVol: number) => void;
  onMedVolChange: (medVol: number) => void;
  onIntervalChange: (intervalMS: number) => void;
}

export default function SettingsButton({
  values,
  onLowVolChange,
  onMedVolChange,
  onIntervalChange,
}: SettingsButtonProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [tempValues, setTempValues] = useState({
    tempLowVol: values.lowVol,
    tempMedVol: values.medVol,
    tempIntervalMS: values.intervalMS,
  });
  const [tipsVisible, setTipsVisible] = useState({
    tip1: false,
    tip2: false,
    tip3: false,
  });

  const handleReset = () => {
    setTempValues({
      tempLowVol: -50,
      tempMedVol: -30,
      tempIntervalMS: 5000,
    });
  };

  const changeDetection = () => {
    return (
      tempValues.tempLowVol !== values.lowVol ||
      tempValues.tempMedVol !== values.medVol ||
      tempValues.tempIntervalMS !== values.intervalMS
    );
  };

  const handleSave = () => {
    if (changeDetection()) {
      onLowVolChange(tempValues.tempLowVol);
      onMedVolChange(tempValues.tempMedVol);
      onIntervalChange(tempValues.tempIntervalMS);
      alert("Settings saved!");
    }
    setIsSettingsOpen(false);
  };

  const handleDiscard = () => {
    setTempValues({
      tempLowVol: values.lowVol,
      tempMedVol: values.medVol,
      tempIntervalMS: values.intervalMS,
    });
    setIsSettingsOpen(false);
  };

  return (
    <div>
      <button
        type='button'
        aria-label={isSettingsOpen ? "Close settings" : "Open settings"}
        aria-expanded={isSettingsOpen}
        aria-controls='settings-panel'
        onClick={() => setIsSettingsOpen(true)}
        className='inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          className='h-5 w-5'
          aria-hidden='true'
        >
          <path // draws gear svg
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path // draws gear svg
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      </button>

      {isSettingsOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <aside
            id='settings-panel'
            role='dialog'
            aria-modal='true'
            aria-label='Settings'
            onClick={(event) => event.stopPropagation()}
            className='w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl'
          >
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Settings</h2>

              <button
                type='button'
                onClick={() => {
                  handleDiscard();
                }}
                aria-label='Close settings'
                className='rounded-lg p-2 text-gray-500 hover:bg-red-400 hover:text-black'
              >
                X
              </button>
            </div>

            <div className='mt-6 space-y-4'>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  className='rounded-lg w-20 border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:ring-blue-500'
                  type='number'
                  placeholder='-100 to 0'
                  defaultValue={values.lowVol}
                  value={tempValues.tempLowVol}
                  onChange={(e) => {
                    if (!e.target.value) return; // if entry is empty, do nothing
                    const value = Number(e.target.value);

                    if (value < values.medVol && value >= -100 && value <= 0) {
                      setTempValues({ ...tempValues, tempLowVol: value });
                    }
                  }}
                />
                Low Volume Threshold (dBFS)
                <button
                  className='outline rounded-md p-2 text-black bg-blue-500 hover:bg-blue-300'
                  onClick={() =>
                    setTipsVisible({ ...tipsVisible, tip1: !tipsVisible.tip1 })
                  }
                >
                  ?
                </button>
                {tipsVisible.tip1 ? (
                  <p className='text-xs text-gray-500'>
                    Set the upper bound for low volume levels.
                  </p>
                ) : null}
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  className='rounded-lg w-20 border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:ring-blue-500'
                  type='number'
                  placeholder='-100 to 0'
                  defaultValue={values.medVol}
                  value={tempValues.tempMedVol}
                  onChange={(e) => {
                    if (!e.target.value) return; // if entry is empty, do nothing
                    const value = Number(e.target.value);

                    if (value > values.lowVol && value >= -100 && value <= 0) {
                      setTempValues({ ...tempValues, tempMedVol: value });
                    }
                  }}
                />
                Medium Volume Threshold (dBFS)
                <button
                  className='outline rounded-md p-2 text-black bg-blue-500 hover:bg-blue-300'
                  onClick={() =>
                    setTipsVisible({ ...tipsVisible, tip2: !tipsVisible.tip2 })
                  }
                >
                  ?
                </button>
                {tipsVisible.tip2 ? (
                  <p className='text-xs text-gray-500'>
                    Set the upper bound for medium volume levels.
                  </p>
                ) : null}
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  className='rounded-lg w-20 border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:ring-blue-500'
                  type='number'
                  placeholder='Milliseconds'
                  defaultValue={values.intervalMS}
                  value={tempValues.tempIntervalMS}
                  onChange={(e) => {
                    if (!e.target.value) return; // if entry is empty, do nothing
                    const value = Number(e.target.value);

                    if (value > 0) {
                      setTempValues({ ...tempValues, tempIntervalMS: value });
                    }
                  }}
                />
                Interval (ms)
                <button
                  className='outline rounded-md p-2 text-black bg-blue-500 hover:bg-blue-300'
                  onClick={() =>
                    setTipsVisible({ ...tipsVisible, tip3: !tipsVisible.tip3 })
                  }
                >
                  ?
                </button>
                {tipsVisible.tip3 ? (
                  <p className='text-xs text-gray-500'>
                    Set the update interval for the average volume indicator.
                  </p>
                ) : null}
              </label>
              <div className='flex justify-center gap-2'>
                <button
                  className='outline rounded-md p-2 text-black bg-gray-100 hover:bg-blue-300'
                  onClick={handleReset}
                >
                  Reset to Defaults
                </button>
                <button
                  className='outline rounded-md p-2 text-black bg-gray-100 hover:bg-green-300'
                  onClick={handleSave}
                >
                  Save & Close
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
