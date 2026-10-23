import type { Suspect } from "../../types";

interface SuspectsTableProps {
  suspects: Suspect[];
  selectedMmsi: string | null;
  onSelect: (mmsi: string) => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-danger font-bold";
  if (score >= 60) return "text-signal font-bold";
  return "text-ink-muted font-medium";
}

export default function SuspectsTable({ suspects, selectedMmsi, onSelect }: SuspectsTableProps) {
  const ranked = [...suspects].sort((a, b) => b.score - a.score);

  return (
    <div className="overflow-hidden rounded-md border border-stroke bg-cream-light shadow-card">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-stroke bg-raised text-[10px] uppercase tracking-wide text-ink-muted">
            <th className="px-2.5 py-2 font-bold">Rank</th>
            <th className="px-2.5 py-2 font-bold">Vessel</th>
            <th className="px-2.5 py-2 font-bold">Score</th>
            <th className="px-2.5 py-2 font-bold">Dist.</th>
            <th className="px-2.5 py-2 font-bold">AIS gap</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((s, i) => {
            const isSelected = selectedMmsi === s.mmsi;
            return (
              <tr
                key={s.mmsi}
                onClick={() => onSelect(s.mmsi)}
                className={`cursor-pointer border-b border-stroke/50 transition-colors last:border-0 ${
                  isSelected ? "bg-sonar/15 border-l-2 border-l-sonar font-medium" : "hover:bg-raised/50"
                }`}
              >
                <td className="px-2.5 py-2 font-mono text-ink-faint">{i + 1}</td>
                <td className="px-2.5 py-2">
                  <p className="font-semibold text-ink-dark">{s.vesselName}</p>
                  <p className="font-mono text-[10px] text-ink-muted">
                    {s.mmsi} · {s.flag}
                  </p>
                </td>
                <td className={`px-2.5 py-2 font-mono ${scoreColor(s.score)}`}>{s.score}</td>
                <td className="px-2.5 py-2 font-mono text-ink-muted">{s.distanceFromOriginNm} nm</td>
                <td className="px-2.5 py-2">
                  {s.aisGapDetected ? (
                    <span className="rounded bg-signal/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-signal">
                      {s.aisGapDurationMin}m
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-ink-faint">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
