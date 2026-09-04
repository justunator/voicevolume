interface LiveAnalysisProps {
  AverageDbfs: number;
  lowVol: number;
  midVol: number;
}

function LiveAnalysis({ AverageDbfs, lowVol, midVol }: LiveAnalysisProps) {
  return (
    <div className='justify-center gap-4 flex flex-col items-center'>
      <span className='text-2xl font-bold text-white'>
        Average Volume: {AverageDbfs === 1 ? "N/A" : AverageDbfs.toFixed(2)}{" "}
        dBFS
      </span>
      {AverageDbfs === 1 ? (
        <div className='box-border size-128 rounded-lg border-4 p-4 transition-colors duration-500' />
      ) : AverageDbfs < lowVol ? (
        <div className='box-border size-128 rounded-lg border-4 bg-green-400 p-4 transition-colors duration-500' />
      ) : AverageDbfs < midVol ? (
        <div className='box-border size-128 rounded-lg border-4 bg-yellow-400 p-4 transition-colors duration-500' />
      ) : (
        <div className='box-border size-128 rounded-lg border-4 bg-red-400 p-4 transition-colors duration-500' />
      )}
    </div>
  );
}

export default LiveAnalysis;
