import { GeoJSON } from "react-leaflet";
import type { GeoJsonFeatureCollection } from "../../types";

interface OriginLayerProps {
  origin: GeoJsonFeatureCollection;
}

export default function OriginLayer({ origin }: OriginLayerProps) {
  return (
    <GeoJSON
      key="origin"
      data={origin as unknown as GeoJSON.GeoJsonObject}
      style={{
        color: "#B86B1B",
        weight: 2,
        dashArray: "6 4",
        fillColor: "#B86B1B",
        fillOpacity: 0.15,
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
  );
}
