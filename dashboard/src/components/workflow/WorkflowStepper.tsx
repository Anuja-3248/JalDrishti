import type { WorkflowStep } from "../../types";

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  activeIndex: number;
}

function formatTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function WorkflowStepper({ steps, activeIndex }: WorkflowStepperProps) {
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-stroke bg-panel">
      <div className="border-b border-stroke px-4 py-3 bg-raised/30">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-muted">
            Investigation Pipeline
          </h2>
          <span className="rounded-full bg-sonar/15 px-2 py-0.5 font-mono text-[10px] font-bold text-sonar">
            {doneCount}/{steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stroke/60">
          <div
            className="h-full bg-gradient-to-r from-sonar to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 py-3">
        {/* Vertical conduit line */}
        <div className="absolute bottom-4 left-[26px] top-4 w-0.5 bg-stroke/60" />

        <ol className="relative flex flex-col gap-1.5">
          {steps.map((step, i) => {
            const isActive = i === activeIndex || step.status === "active";
            const isDone = step.status === "done";
            const isFailed = step.status === "failed";

            return (
              <li
                key={step.id}
                className={`relative flex items-start gap-3 rounded-lg p-2 transition-all duration-300 ${
                  isActive
                    ? "bg-sonar/10 border border-sonar/30 shadow-sm"
                    : isDone
                    ? "bg-surface/40 hover:bg-surface/70"
                    : "opacity-60"
                }`}
              >
                {/* Status Indicator Icon */}
                <div className="relative flex w-6 shrink-0 justify-center pt-0.5 z-10">
                  {isDone ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-transform duration-300 scale-100">
                      <svg className="h-3 w-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-sonar bg-panel text-sonar shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                      <span className="h-2 w-2 rounded-full bg-sonar animate-ping" />
                    </div>
                  ) : isFailed ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-stroke bg-raised text-[10px] font-mono text-ink-faint">
                      {i + 1}
                    </div>
                  )}
                </div>

                {/* Step Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs font-semibold leading-snug transition-colors ${
                        isActive
                          ? "text-sonar font-bold"
                          : isDone
                          ? "text-ink-dark"
                          : "text-ink-faint font-normal"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isDone && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                        ✓ Done
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-amber-500 animate-pulse font-mono">
                        Analyzing…
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{step.detail}</p>
                  {step.timestamp && isDone && (
                    <p className="mt-0.5 font-mono text-[9px] text-ink-faint">
                      {formatTime(step.timestamp)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
