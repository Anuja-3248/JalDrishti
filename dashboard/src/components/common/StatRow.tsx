interface StatRowProps {
  label: string;
  value: string | number;
  accent?: "sonar" | "signal" | "danger" | "muted";
}

const accentClass: Record<NonNullable<StatRowProps["accent"]>, string> = {
  sonar: "text-sonar font-bold",
  signal: "text-signal font-bold",
  danger: "text-danger font-bold",
  muted: "text-ink-muted",
};

export default function StatRow({ label, value, accent }: StatRowProps) {
  return (
    <div className="rounded border border-stroke bg-cream-light px-2.5 py-2 shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-semibold ${accent ? accentClass[accent] : "text-ink-dark"}`}>
        {value}
      </p>
    </div>
  );
}
