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
            color: "#C53B3B",
            weight: 2,
            fillColor: "#C53B3B",
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
            color: "#8A766B",
            weight: 1.5,
            dashArray: "4 3",
            fillColor: "#8A766B",
            fillOpacity: 0.15,
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
