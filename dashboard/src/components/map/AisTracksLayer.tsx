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
              pathOptions={{ color, weight, opacity, dashArray }}
              eventHandlers={{ click: () => onSelectVessel(mmsi) }}
            >
              <Tooltip sticky opacity={0.98}>
                <div className="font-mono text-[11px] text-ink">
                  <strong className="text-ink-dark">{feature.properties.name}</strong>
                  <br />
                  MMSI {mmsi} · {feature.properties.type}
                  {suspect && (
                    <>
                      <br />
                      <span className="font-bold text-danger">Suspect score: {suspect.score}</span>
                    </>
                  )}
                </div>
              </Tooltip>
            </Polyline>
            <CircleMarker
              center={head}
              radius={isSelected ? 6 : isSuspect ? 5 : 3.5}
              pathOptions={{
                color: isSelected ? "#1E293B" : color,
                fillColor: color,
                fillOpacity: 0.95,
                weight: isSelected ? 2.5 : 1.2,
              }}
              eventHandlers={{ click: () => onSelectVessel(mmsi) }}
            />
          </Fragment>
        );
      })}
    </>
  );
}
