interface LiveAnalysisProps {
  AverageDbfs: number;
}

const lowVol = -50;
const midVol = -30;

function LiveAnalysis({ AverageDbfs }: LiveAnalysisProps) {
  return (
    <div className='flex justify-center gap-4'>
      {AverageDbfs === 1 ? ( // If theres no data
        <div className='box-border rounded-lg size-128 border-4 p-4' />
      ) : AverageDbfs < lowVol ? (
        <div className='box-border rounded-lg size-128 border-4 p-4 bg-green-400' />
      ) : AverageDbfs < midVol ? (
        <div className='box-border rounded-lg size-128 border-4 p-4 bg-yellow-400' />
      ) : (
        <div className='box-border rounded-lg size-128 border-4 p-4 bg-red-400' />
      )}
    </div>
  );
}

export default LiveAnalysis;
