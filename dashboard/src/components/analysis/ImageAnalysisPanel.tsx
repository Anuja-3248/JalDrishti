import type { ImageAnalysisMetrics } from "../../types";
import StatRow from "../common/StatRow";

export default function ImageAnalysisPanel({ metrics }: { metrics: ImageAnalysisMetrics }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-stroke bg-raised px-3 py-2 shadow-card">
        <p className="font-mono text-[11px] font-medium text-ink-muted">{metrics.sceneId}</p>
        <p className="mt-0.5 text-xs font-semibold text-ink-dark">{metrics.satellite}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatRow label="Resolution" value={`${metrics.resolutionM} m`} />
        <StatRow label="Dark patches" value={metrics.darkPatchesDetected} />
        <StatRow label="Confirmed slicks" value={metrics.confirmedSlicks} accent="danger" />
        <StatRow label="Look-alikes rejected" value={metrics.lookAlikesRejected} accent="muted" />
        <StatRow label="Avg. confidence" value={`${(metrics.avgConfidence * 100).toFixed(0)}%`} accent="sonar" />
        <StatRow label="Slick area" value={`${metrics.slickAreaKm2} km²`} />
      </div>
    </div>
  );
}
