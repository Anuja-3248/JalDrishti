import type { WorkflowStep } from "../../types";

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  activeIndex: number;
}

const statusDot: Record<WorkflowStep["status"], string> = {
  pending: "bg-stroke",
  active: "bg-signal shadow-[0_0_6px_1px_rgba(184,107,27,0.4)]",
  done: "bg-sonar shadow-[0_0_6px_1px_rgba(38,126,126,0.4)]",
  failed: "bg-danger shadow-[0_0_6px_1px_rgba(197,59,59,0.4)]",
};

function formatTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WorkflowStepper({ steps, activeIndex }: WorkflowStepperProps) {
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-stroke bg-panel">
      <div className="border-b border-stroke px-4 py-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-muted">
          Investigation Pipeline
        </h2>
        <p className="mt-1 font-mono text-[11px] text-ink-faint">
          {doneCount}/{steps.length} stages complete
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 py-4">
        {/* Vertical conduit line */}
        <div className="absolute bottom-4 left-[27px] top-4 w-px bg-stroke" />

        <ol className="relative flex flex-col gap-1">
          {steps.map((step, i) => {
            const isActive = i === activeIndex && step.status === "active";
            return (
              <li key={step.id} className="relative flex gap-3 py-2.5">
                <div className="relative flex w-4 shrink-0 justify-center pt-0.5">
                  {isActive && (
                    <span
                      className="absolute h-2.5 w-2.5 rounded-full bg-signal/70"
                      style={{ ["--travel" as string]: "0px" }}
                    />
                  )}
                  <span
                    className={`relative z-10 h-2.5 w-2.5 rounded-full transition-colors ${statusDot[step.status]}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold leading-snug ${
                      step.status === "pending" ? "text-ink-faint font-normal" : "text-ink-dark"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{step.detail}</p>
                  {step.timestamp && step.status === "done" && (
                    <p className="mt-0.5 font-mono text-[10px] font-medium text-sonar">
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
