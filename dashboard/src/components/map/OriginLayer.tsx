import { GeoJSON, CircleMarker, Tooltip } from "react-leaflet";
import type { GeoJsonFeatureCollection } from "../../types";

interface OriginLayerProps {
  origin: GeoJsonFeatureCollection;
}

export default function OriginLayer({ origin }: OriginLayerProps) {
  if (!origin || !origin.features || origin.features.length === 0) return null;

  const feature = origin.features[0];
  const coords = feature?.geometry?.type === "Polygon" ? (feature.geometry.coordinates[0] as [number, number][]) : [];
  
  // Calculate center of polygon
  let centerLat = 17.15;
  let centerLon = 71.95;
  if (coords.length > 0) {
    centerLon = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
    centerLat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
  }

  return (
    <>
      <GeoJSON
        key="origin"
        data={origin as unknown as GeoJSON.GeoJsonObject}
        style={{
          color: "#F59E0B",
          weight: 2,
          dashArray: "6 4",
          fillColor: "#F59E0B",
          fillOpacity: 0.18,
        }}
        onEachFeature={(feature, layer) => {
          const p = feature.properties ?? {};
          layer.bindPopup(
            `<strong>Hindcast Origin Zone</strong><br/>Est. release: ${new Date(
              p.estimatedReleaseTime
            ).toUTCString()}<br/>Method: ${String(p.method).replace(/_/g, " ")}`
          );
        }}
      />

      {/* Outer Radiating Sonar Wave */}
      <CircleMarker
        center={[centerLat, centerLon]}
        radius={26}
        pathOptions={{
          color: "#F59E0B",
          fillColor: "#F59E0B",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "5 5",
        }}
      />

      {/* Radar Center Ping Circle */}
      <CircleMarker
        center={[centerLat, centerLon]}
        radius={11}
        pathOptions={{
          color: "#FFFFFF",
          fillColor: "#EF4444",
          fillOpacity: 0.75,
          weight: 2,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -12]} opacity={0.95}>
          <div className="flex items-center gap-1.5 rounded bg-slate-950/90 border border-amber-500/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 shadow-xl backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>🎯 HINDCAST ORIGIN (T-6.2h)</span>
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  );
}
