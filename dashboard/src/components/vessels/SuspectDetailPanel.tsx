import type { Suspect } from "../../types";

const weightColor: Record<Suspect["evidence"][number]["weight"], string> = {
  high: "border-danger/40 bg-danger/10 text-danger",
  medium: "border-signal/40 bg-signal/10 text-signal",
  low: "border-stroke bg-cream-light text-ink-muted",
};

export default function SuspectDetailPanel({ suspect }: { suspect: Suspect | null }) {
  if (!suspect) {
    return (
      <div className="rounded-md border border-dashed border-stroke bg-cream-light/60 px-3 py-6 text-center text-xs text-ink-faint">
        Select a suspect from the table or map to view details.
      </div>
    );
  }

  const lastPoint = suspect.track[suspect.track.length - 1];

  return (
    <div className="flex flex-col gap-3 rounded-md border border-stroke bg-raised/50 p-3 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-ink-dark">{suspect.vesselName}</p>
          <p className="font-mono text-[11px] text-ink-muted">
            MMSI {suspect.mmsi} · {suspect.vesselType} · Flag {suspect.flag}
          </p>
        </div>
        <div className="rounded border border-danger/40 bg-danger/10 px-2 py-1 text-center shadow-sm">
          <p className="text-[9px] font-bold uppercase text-danger">Score</p>
          <p className="font-mono text-sm font-bold text-danger">{suspect.score}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded border border-stroke bg-cream-light px-2 py-1.5 shadow-card">
          <p className="text-[10px] font-medium uppercase text-ink-faint">Last speed</p>
          <p className="font-mono font-semibold text-ink-dark">{lastPoint?.speedKn ?? "—"} kn</p>
        </div>
        <div className="rounded border border-stroke bg-cream-light px-2 py-1.5 shadow-card">
          <p className="text-[10px] font-medium uppercase text-ink-faint">Last course</p>
          <p className="font-mono font-semibold text-ink-dark">{lastPoint?.courseDeg ?? "—"}°</p>
        </div>
        <div className="rounded border border-stroke bg-cream-light px-2 py-1.5 shadow-card">
          <p className="text-[10px] font-medium uppercase text-ink-faint">Closest approach</p>
          <p className="font-mono font-semibold text-ink-dark">
            {new Date(suspect.closestApproachTime).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="rounded border border-stroke bg-cream-light px-2 py-1.5 shadow-card">
          <p className="text-[10px] font-medium uppercase text-ink-faint">Course deviation</p>
          <p className="font-mono font-semibold text-ink-dark">{suspect.courseDeviationDeg}°</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint">Evidence chain</p>
        <ul className="flex flex-col gap-1.5">
          {suspect.evidence.map((e) => (
            <li key={e.label} className={`rounded border px-2.5 py-1.5 text-[11px] shadow-sm ${weightColor[e.weight]}`}>
              <p className="font-semibold">{e.label}</p>
              <p className="mt-0.5 opacity-90">{e.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
