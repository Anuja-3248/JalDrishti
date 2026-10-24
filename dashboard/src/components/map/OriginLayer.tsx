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

      {/* Radar Center Ping Circle */}
      <CircleMarker
        center={[centerLat, centerLon]}
        radius={12}
        pathOptions={{
          color: "#EF4444",
          fillColor: "#EF4444",
          fillOpacity: 0.4,
          weight: 2,
          dashArray: "3 3",
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          <span className="font-mono text-[10px] font-bold text-danger">🎯 Estimated Discharge Origin</span>
        </Tooltip>
      </CircleMarker>
    </>
  );
}
