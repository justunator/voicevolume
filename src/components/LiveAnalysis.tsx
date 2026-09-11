import { ZONE_BG, volumeZone } from "../lib/volume.ts";

interface LiveAnalysisProps {
  currentDb: number | null;
  lowDb: number;
  medDb: number;
}

function LiveAnalysis({ currentDb, lowDb, medDb }: LiveAnalysisProps) {
  const zoneClass =
    currentDb === null ? "" : ZONE_BG[volumeZone(currentDb, lowDb, medDb)];

  return (
    <div className="justify-center gap-4 flex flex-col items-center">
      <span className="text-2xl font-bold">
        Volume: {currentDb === null ? "N/A" : currentDb.toFixed(0)} dB
      </span>

      <div
        className={`box-border size-128 rounded-lg border-4 p-4 transition-colors duration-500 ${zoneClass}`}
      />
    </div>
  );
}

export default LiveAnalysis;
