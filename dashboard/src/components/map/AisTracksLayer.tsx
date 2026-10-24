import { Fragment } from "react";
import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { Suspect, GeoJsonFeatureCollection } from "../../types";

interface AisTracksLayerProps {
  tracks: GeoJsonFeatureCollection<{ mmsi: string; suspect: boolean; name: string; type: string; flag: string }>;
  suspects: Suspect[];
  progress: number; // 0..1 — how much of each track to reveal
  selectedMmsi: string | null;
  onSelectVessel: (mmsi: string) => void;
}

function revealedPoints(coords: [number, number][], progress: number): [number, number][] {
  const count = Math.max(2, Math.ceil(coords.length * progress));
  return coords.slice(0, count);
}

export default function AisTracksLayer({
  tracks,
  suspects,
  progress,
  selectedMmsi,
  onSelectVessel,
}: AisTracksLayerProps) {
  if (!tracks || !tracks.features || tracks.features.length === 0) return null;

  const suspectMap = new Map(suspects.map((s) => [s.mmsi, s]));

  return (
    <>
      {tracks.features.map((feature) => {
        const mmsi = feature.properties.mmsi;
        const isSuspect = feature.properties.suspect;
        const isSelected = selectedMmsi === mmsi;
        const coords =
          feature.geometry.type === "LineString"
            ? (feature.geometry.coordinates as [number, number][])
            : [];
        const revealed = revealedPoints(coords, progress);
        if (revealed.length < 2) return null;

        const latlngs: [number, number][] = revealed.map(([lon, lat]) => [lat, lon]);
        const suspect = suspectMap.get(mmsi);
        const head = latlngs[latlngs.length - 1];
        const color = isSelected ? "#EF4444" : isSuspect ? "#DC2626" : "#0891B2";
        const weight = isSelected ? 4 : isSuspect ? 2.8 : 1.5;
        const opacity = isSelected ? 1.0 : isSuspect ? 0.95 : 0.55;
        const dashArray = isSelected ? "7 4" : undefined;

        return (
          <Fragment key={mmsi}>
            <Polyline
              positions={latlngs}
              pathOptions={{
                color,
                weight,
                opacity,
                dashArray,
              }}
              eventHandlers={{ click: () => onSelectVessel(mmsi) }}
            >
              <Tooltip sticky opacity={0.98}>
                <div className="font-mono text-[11px] text-slate-900">
                  <div className="font-bold text-[12px] flex items-center gap-1.5 border-b border-slate-200 pb-1 mb-1">
                    {isSuspect ? "🎯" : "🚢"} {feature.properties.name}
                  </div>
                  <div><strong>MMSI:</strong> {mmsi}</div>
                  <div><strong>Type:</strong> {feature.properties.type}</div>
                  <div><strong>Flag:</strong> {feature.properties.flag || "Panama"}</div>
                  {suspect && (
                    <div className="mt-1 pt-1 border-t border-red-200 text-red-600 font-bold">
                      Match Score: {suspect.score > 1 ? suspect.score : Math.round(suspect.score * 100)}%
                    </div>
                  )}
                </div>
              </Tooltip>
            </Polyline>

            {/* Glowing radar halo for suspects / selected vessel */}
            {(isSuspect || isSelected) && (
              <CircleMarker
                center={head}
                radius={isSelected ? 16 : 12}
                pathOptions={{
                  color: isSelected ? "#EF4444" : "#F87171",
                  fillColor: isSelected ? "#EF4444" : "#F87171",
                  fillOpacity: 0.25,
                  weight: 1.5,
                  dashArray: "3 3",
                }}
              />
            )}

            {/* Vessel Head Marker */}
            <CircleMarker
              center={head}
              radius={isSelected ? 6.5 : isSuspect ? 5.5 : 3.5}
              pathOptions={{
                color: isSelected ? "#FFFFFF" : isSuspect ? "#FFFFFF" : color,
                fillColor: color,
                fillOpacity: 1,
                weight: isSelected || isSuspect ? 2 : 1,
              }}
              eventHandlers={{ click: () => onSelectVessel(mmsi) }}
            >
              {isSuspect && (
                <Tooltip permanent direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="flex items-center gap-1 rounded bg-slate-950/90 border border-red-500/80 px-2 py-0.5 text-[10px] font-mono font-bold text-red-300 shadow-lg backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>{feature.properties.name}</span>
                    <span className="text-red-400 font-normal">
                      ({suspect?.score ? (suspect.score > 1 ? Math.round(suspect.score) : Math.round(suspect.score * 100)) : 99}%)
                    </span>
                  </div>
                </Tooltip>
              )}
            </CircleMarker>
          </Fragment>
        );
      })}
    </>
  );
}
