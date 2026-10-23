import { useState } from "react";
import type { PipelineResponse, ReportSummary } from "../../types";

function buildReportSummary(data: PipelineResponse): ReportSummary {
  const top = [...data.suspects].sort((a, b) => b.score - a.score)[0];
  return {
    incidentId: data.incidentId,
    generatedAt: new Date().toISOString(),
    slickAreaKm2: data.imageAnalysis.slickAreaKm2,
    topSuspect: top?.vesselName ?? "Unresolved",
    topSuspectScore: top?.score ?? 0,
    evidenceCount: top?.evidence.length ?? 0,
    recommendedAction: "Escalate to Indian Coast Guard regional command for vessel interdiction and boarding.",
  };
}

export default function ReportPanel({ data }: { data: PipelineResponse }) {
  const [open, setOpen] = useState(false);
  const summary = buildReportSummary(data);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-ink-muted">
        Compiles the SAR detection, hindcast attribution, and vessel evidence chain into a
        submission-ready incident report.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-sonar/50 bg-sonar/10 px-3 py-2 text-xs font-bold text-sonar transition hover:bg-sonar/20 shadow-sm"
      >
        Generate Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-stroke bg-cream-light p-5 shadow-panel"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-ink-dark">Incident Report</h3>
              <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink-dark text-sm font-bold" aria-label="Close">
                ✕
              </button>
            </div>
            <dl className="flex flex-col gap-2 text-xs">
              <Row label="Incident ID" value={summary.incidentId} />
              <Row
                label="Generated"
                value={new Date(summary.generatedAt).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
              <Row label="Slick area" value={`${summary.slickAreaKm2} km²`} />
              <Row label="Top suspect" value={summary.topSuspect} />
              <Row label="Suspect score" value={`${summary.topSuspectScore} / 100`} />
              <Row label="Evidence items" value={String(summary.evidenceCount)} />
              <Row label="Recommended action" value={summary.recommendedAction} />
            </dl>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded bg-sonar px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sonar-dim"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-stroke/60 pb-1.5">
      <dt className="text-ink-faint font-medium">{label}</dt>
      <dd className="text-right font-semibold text-ink-dark">{value}</dd>
    </div>
  );
}
