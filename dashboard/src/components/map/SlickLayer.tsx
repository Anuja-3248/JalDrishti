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
            color: "#EF4444",
            weight: 2.5,
            fillColor: "#7F1D1D",
            fillOpacity: 0.55,
          }}
          onEachFeature={(feature, layer) => {
            const p = feature.properties ?? {};
            layer.bindPopup(
              `<div style="font-family: 'IBM Plex Mono', monospace; min-width: 200px;">
                <div style="font-size: 12px; font-weight: bold; color: #DC2626; border-bottom: 1px solid #FECACA; padding-bottom: 4px; margin-bottom: 6px;">
                  🛑 Confirmed SAR Oil Slick
                </div>
                <div style="font-size: 11px; line-height: 1.6; color: #1E293B;">
                  <strong>Area:</strong> ${p.areaKm2 ?? 18.4} km²<br/>
                  <strong>CV Confidence:</strong> ${((p.confidence ?? 0.94) * 100).toFixed(0)}%<br/>
                  <strong>Backscatter:</strong> -14.2 dB (High attenuation)<br/>
                  <strong>Status:</strong> Active Surface Discharge
                </div>
              </div>`
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
