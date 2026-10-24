import { GeoJSON } from "react-leaflet";
import type { GeoJsonFeatureCollection } from "../../types";

interface SlickLayerProps {
  slick: GeoJsonFeatureCollection;
  lookalikes: GeoJsonFeatureCollection;
  showLookalikes: boolean;
}

export default function SlickLayer({ slick, lookalikes, showLookalikes }: SlickLayerProps) {
  const hasSlick = slick && slick.features && slick.features.length > 0;
  const hasLookalikes = showLookalikes && lookalikes && lookalikes.features && lookalikes.features.length > 0;
  if (!hasSlick && !hasLookalikes) return null;

  return (
    <>
      {hasSlick && (
        <GeoJSON
          key="slick"
          data={slick as unknown as GeoJSON.GeoJsonObject}
          style={{
            color: "#DC2626",
            weight: 2,
            fillColor: "#DC2626",
            fillOpacity: 0.35,
          }}
          onEachFeature={(feature, layer) => {
            const p = feature.properties ?? {};
            layer.bindPopup(
              `<strong>Confirmed Oil Slick</strong><br/>Area: ${p.areaKm2} km²<br/>Confidence: ${(
                (p.confidence ?? 0) * 100
              ).toFixed(0)}%`
            );
          }}
        />
      )}
      {hasLookalikes && (
        <GeoJSON
          key="lookalikes"
          data={lookalikes as unknown as GeoJSON.GeoJsonObject}
          style={{
            color: "#94A3B8",
            weight: 1.5,
            dashArray: "4 3",
            fillColor: "#94A3B8",
            fillOpacity: 0.12,
          }}
          onEachFeature={(feature, layer) => {
            const p = feature.properties ?? {};
            layer.bindPopup(
              `<strong>Look-alike (rejected)</strong><br/>Reason: ${String(p.reason).replace(
                /_/g,
                " "
              )}<br/>Confidence: ${((p.confidence ?? 0) * 100).toFixed(0)}%`
            );
          }}
        />
      )}
    </>
  );
}
