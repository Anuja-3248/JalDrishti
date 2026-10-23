interface TopBarProps {
  region: string;
  regions: string[];
  onRegionChange: (region: string) => void;
  onRunPipeline: () => void;
  isRunning: boolean;
  incidentId?: string;
  liveStatus?: {
    connected: boolean;
    activeVesselsCount: number;
    messagesReceived: number;
  } | null;
  onNavigateHome?: () => void;
}

export default function TopBar({
  region,
  regions,
  onRegionChange,
  onRunPipeline,
  isRunning,
  incidentId,
  liveStatus,
  onNavigateHome,
}: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stroke bg-panel px-4 shadow-card">
      <div className="flex items-center gap-3">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            title="Return to AegisOcean Home Portal"
            className="flex items-center gap-1.5 rounded border border-stroke bg-cream-light px-2.5 py-1 text-xs font-semibold text-ink-muted transition hover:border-sonar hover:bg-raised hover:text-ink-dark"
          >
            <i className="fa-solid fa-arrow-left text-[11px] text-sonar" />
            <span>Portal</span>
          </button>
        )}

        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sonar/40 bg-sonar/10">
          <span className="h-2.5 w-2.5 rounded-full bg-sonar shadow-[0_0_8px_1px_rgba(38,126,126,0.5)]" />
        </div>
        <div className="leading-tight">
          <h1 className="font-display text-sm font-bold tracking-wide text-ink-dark">
            AEGIS<span className="text-sonar">OCEAN</span>
          </h1>
          <p className="font-mono text-[10px] text-ink-muted">
            Oil Spill Investigation Dashboard
          </p>
        </div>
        {incidentId && (
          <span className="ml-3 rounded border border-stroke bg-raised px-2 py-1 font-mono text-[10px] font-medium text-ink-muted">
            {incidentId}
          </span>
        )}
        {liveStatus && (
          <div className="ml-2 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono text-emerald-700">
            <span className={`h-2 w-2 rounded-full ${liveStatus.connected ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" : "bg-amber-500"}`} />
            <span className="font-bold">{liveStatus.connected ? "LIVE AIS" : "AIS STANDBY"}</span>
            <span className="text-ink-muted font-normal">| {liveStatus.activeVesselsCount} active vessels</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-ink-muted">
          <span className="hidden sm:inline">Region</span>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="rounded border border-stroke bg-cream-light px-2.5 py-1.5 font-mono text-xs text-ink outline-none focus:border-sonar"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={onRunPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 rounded bg-sonar px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sonar-dim disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Running pipeline…
            </>
          ) : (
            <>Run Pipeline</>
          )}
        </button>
      </div>
    </header>
  );
}
