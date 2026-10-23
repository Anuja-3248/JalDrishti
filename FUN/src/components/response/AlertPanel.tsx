import { useState } from "react";
import type { AlertInfo } from "../../types";

const severityStyle: Record<AlertInfo["severity"], string> = {
  low: "border-sonar/40 bg-sonar/10 text-sonar",
  moderate: "border-signal/40 bg-signal/10 text-signal",
  high: "border-danger/40 bg-danger/10 text-danger",
  critical: "border-danger bg-danger/20 text-danger",
};

export default function AlertPanel({
  alert,
  onSubmit,
}: {
  alert: AlertInfo;
  onSubmit: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className={`rounded-md border px-3 py-2.5 shadow-card ${severityStyle[alert.severity]}`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide">{alert.alertId}</span>
          <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-bold uppercase">
            {alert.severity}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-ink-dark">{alert.message}</p>
        <p className="mt-1.5 font-mono text-[10px] font-medium opacity-80">{alert.region}</p>
      </div>

      <button
        onClick={() => {
          setSubmitted(true);
          onSubmit();
        }}
        className="rounded bg-signal px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-signal-dim"
      >
        {submitted ? "Alert Submitted ✓" : "Submit Alert"}
      </button>
      {submitted && (
        <p className="text-center font-mono text-[10px] text-ink-muted">
          Notified coastal command · no live backend call
        </p>
      )}
    </div>
  );
}
