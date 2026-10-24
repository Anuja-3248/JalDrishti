import { CircleMarker, GeoJSON, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet";
import type { PipelineResponse, Suspect, VesselTrackPoint } from "../../types";
import SlickLayer from "./SlickLayer";
import OriginLayer from "./OriginLayer";
import ForecastLayer from "./ForecastLayer";
import AisTracksLayer from "./AisTracksLayer";

interface MapViewProps {
  data: PipelineResponse | null;
  timelineHours: number;
  selectedSuspect: Suspect | null;
  onSelectVessel: (mmsi: string) => void;
  showLookalikes: boolean;
  showResponsePoints: boolean;
}

const responseColor: Record<string, string> = {
  vessel: "#0891B2",
  boom: "#D97706",
  skimmer: "#2563EB",
  sample: "#7C3AED",
};

function trackToLatLngs(track: VesselTrackPoint[]): [number, number][] {
  return track.map((p) => [p.lat, p.lon]);
}

export default function MapView({
  data,
  timelineHours,
  selectedSuspect,
  onSelectVessel,
  showLookalikes,
  showResponsePoints,
}: MapViewProps) {
  const center: [number, number] = [17.3, 71.9];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={9}
        className="h-full w-full"
        zoomControl={true}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data && (
          <>
            <GeoJSON
              key="sar-footprint"
              data={data.sarFootprint as unknown as GeoJSON.GeoJsonObject}
              style={{ color: "#94A3B8", weight: 1.5, dashArray: "4 4", fillOpacity: 0 }}
            />

            <SlickLayer slick={data.slick} lookalikes={data.lookalikes} showLookalikes={showLookalikes} />
            <OriginLayer origin={data.origin} />
            <ForecastLayer forecast={data.forecast} activeHour={timelineHours} />

            <AisTracksLayer
              tracks={data.tracks}
              suspects={data.suspects}
              progress={Math.min(1, 0.35 + timelineHours / 48)}
              selectedMmsi={selectedSuspect?.mmsi ?? null}
              onSelectVessel={onSelectVessel}
            />

            {selectedSuspect && (
              <Polyline
                positions={trackToLatLngs(selectedSuspect.track)}
                pathOptions={{ color: "#1E293B", weight: 3.5, opacity: 0.95, dashArray: "2 6" }}
              />
            )}

            {showResponsePoints &&
              data.responsePoints.map((rp) => (
                <CircleMarker
                  key={rp.id}
                  center={[rp.lat, rp.lon]}
                  radius={6}
                  pathOptions={{
                    color: responseColor[rp.type] ?? "#3E3E3E",
                    fillColor: responseColor[rp.type] ?? "#3E3E3E",
                    fillOpacity: rp.status === "complete" ? 0.35 : 0.9,
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]}>
                    <div className="font-mono text-[11px] text-ink">
                      <strong className="text-ink-dark">{rp.label}</strong>
                      <br />
                      {rp.type} · {rp.status.replace("_", " ")}
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
          </>
        )}
      </MapContainer>

      <MapLegend />
    </div>
  );
}

function MapLegend() {
  const items: { color: string; label: string; dash?: boolean }[] = [
    { color: "#C53B3B", label: "Confirmed slick" },
    { color: "#8A766B", label: "Look-alike (rejected)", dash: true },
    { color: "#B86B1B", label: "Hindcast origin" },
    { color: "#267E7E", label: "Forecast plume" },
    { color: "#C53B3B", label: "Suspect vessel track" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
      <ul className="flex flex-col gap-1.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span
              className="inline-block h-1.5 w-4 rounded-sm"
              style={{
                backgroundColor: it.color,
                backgroundImage: it.dash
                  ? `repeating-linear-gradient(90deg, ${it.color} 0 3px, transparent 3px 6px)`
                  : undefined,
              }}
            />
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
