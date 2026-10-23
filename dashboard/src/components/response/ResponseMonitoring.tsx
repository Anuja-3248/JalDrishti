import type { ForecastSlice, ResponsePoint } from "../../types";

const statusStyle: Record<ResponsePoint["status"], string> = {
  en_route: "text-signal font-semibold",
  on_site: "text-sonar font-semibold",
  complete: "text-ink-faint font-medium",
};

const typeIcon: Record<ResponsePoint["type"], string> = {
  vessel: "⛴",
  boom: "◠",
  skimmer: "◉",
  sample: "◇",
};

export default function ResponseMonitoring({
  responsePoints,
  forecast,
  timelineHours,
}: {
  responsePoints: ResponsePoint[];
  forecast: ForecastSlice[];
  timelineHours: number;
}) {
  const activeSlice = forecast.reduce((closest, s) =>
    Math.abs(s.hoursFromDetection - timelineHours) < Math.abs(closest.hoursFromDetection - timelineHours)
      ? s
      : closest
  );
  const observedAreaKm2 = forecast[0].polygon.properties.areaKm2;
  const forecastAreaKm2 = activeSlice.polygon.properties.areaKm2;
  const growth = (((forecastAreaKm2 - observedAreaKm2) / observedAreaKm2) * 100).toFixed(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-stroke bg-cream-light px-2.5 py-2 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Observed area (t0)</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-ink-dark">{observedAreaKm2} km²</p>
        </div>
        <div className="rounded border border-stroke bg-cream-light px-2.5 py-2 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Forecast @ +{activeSlice.hoursFromDetection}h
          </p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-sonar">
            {forecastAreaKm2} km² <span className="text-[10px] text-ink-muted font-normal">(+{growth}%)</span>
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint">Deployed assets</p>
        <ul className="flex flex-col gap-1.5">
          {responsePoints.map((rp) => (
            <li
              key={rp.id}
              className="flex items-center justify-between rounded border border-stroke bg-cream-light px-2.5 py-1.5 text-[11px] shadow-sm"
            >
              <span className="flex items-center gap-2 font-medium text-ink-dark">
                <span aria-hidden className="text-sonar">{typeIcon[rp.type]}</span>
                {rp.label}
              </span>
              <span className={`font-mono text-[10px] ${statusStyle[rp.status]}`}>{rp.status.replace("_", " ")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
