import type { AisAnalysisMetrics } from "../../types";
import StatRow from "../common/StatRow";

function formatWindow(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} → ${fmt(e)}`;
}

export default function AisAnalysisPanel({ metrics }: { metrics: AisAnalysisMetrics }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-stroke bg-raised px-3 py-2 shadow-card">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Analysis window</p>
        <p className="mt-0.5 font-mono text-[11px] font-medium text-ink-dark">
          {formatWindow(metrics.windowStart, metrics.windowEnd)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatRow label="Vessels in region" value={metrics.vesselsInRegion} />
        <StatRow label="Tracks loaded" value={metrics.tracksLoaded} />
        <StatRow label="Transmission gaps" value={metrics.transmissionGapsFound} accent="signal" />
        <StatRow label="Matched to origin" value={metrics.vesselsMatchedToOrigin} accent="sonar" />
        <StatRow label="Suspects flagged" value={metrics.suspectsFlagged} accent="danger" />
      </div>
    </div>
  );
}
