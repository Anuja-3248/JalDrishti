import { GeoJSON } from "react-leaflet";
import type { ForecastSlice } from "../../types";

interface ForecastLayerProps {
  forecast: ForecastSlice[];
  activeHour: number;
}

export default function ForecastLayer({ forecast, activeHour }: ForecastLayerProps) {
  const active = forecast.reduce((closest, slice) =>
    Math.abs(slice.hoursFromDetection - activeHour) < Math.abs(closest.hoursFromDetection - activeHour)
      ? slice
      : closest
  );

  return (
    <GeoJSON
      key={`forecast-${active.hoursFromDetection}`}
      data={active.polygon as unknown as GeoJSON.GeoJsonObject}
      style={{
        color: "#267E7E",
        weight: 1.8,
        dashArray: "3 5",
        fillColor: "#267E7E",
        fillOpacity: 0.2,
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties ?? {};
        layer.bindPopup(
          `<strong>Forecast +${p.hours}h</strong><br/>Projected area: ${p.areaKm2} km²`
        );
      }}
    />
  );
}
