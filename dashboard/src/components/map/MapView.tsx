import { useState, useEffect } from "react";
import type L from "leaflet";
import {
  Circle,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
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

const BASEMAPS = {
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    icon: "fa-satellite",
  },
  dark: {
    label: "Dark Navy",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, HERE, Garmin",
    icon: "fa-shield-halved",
  },
  ocean: {
    label: "Bathymetry",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, GEBCO, NOAA, Garmin",
    icon: "fa-water",
  },
  standard: {
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    icon: "fa-map",
  },
};

const responseColor: Record<string, string> = {
  vessel: "#0891B2",
  boom: "#D97706",
  skimmer: "#2563EB",
  sample: "#7C3AED",
};

function trackToLatLngs(track: VesselTrackPoint[]): [number, number][] {
  return track.map((p) => [p.lat, p.lon]);
}

// MapBridge to safely expose map instance to outer UI controls
function MapBridge({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

// Mouse coordinates tracker
function MapEventsWatcher({ onCoordChange }: { onCoordChange: (c: { lat: number; lng: number } | null) => void }) {
  useMapEvents({
    mousemove(e) {
      onCoordChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseout() {
      onCoordChange(null);
    },
  });
  return null;
}

// Tactical Range Rings component (5 NM, 15 NM, 30 NM)
function RangeRings({ center, visible }: { center: [number, number]; visible: boolean }) {
  if (!visible) return null;
  const rings = [
    { radius: 9260, label: "5 NM · Core Impact Zone", color: "#EF4444" },
    { radius: 27780, label: "15 NM · Hindcast Attribution Zone", color: "#F59E0B" },
    { radius: 55560, label: "30 NM · EEZ Surveillance AOI", color: "#06B6D4" },
  ];

  return (
    <>
      {rings.map((r) => (
        <Circle
          key={r.label}
          center={center}
          radius={r.radius}
          pathOptions={{
            color: r.color,
            fillColor: r.color,
            fillOpacity: 0.02,
            weight: 1.2,
            dashArray: "4 6",
          }}
        >
          <Tooltip sticky direction="top" opacity={0.92}>
            <span className="font-mono text-[10px] font-bold text-slate-900">{r.label}</span>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
}

// Custom Glassmorphic Zoom Controls
function CustomZoomControls({ map }: { map: L.Map | null }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/20 bg-slate-900/90 shadow-xl backdrop-blur-md overflow-hidden">
      <button
        type="button"
        onClick={() => map?.zoomIn()}
        title="Zoom In"
        className="flex h-7 w-7 items-center justify-center text-slate-200 hover:bg-white/10 hover:text-sonar transition border-b border-white/10 text-xs font-bold"
      >
        <i className="fa-solid fa-plus text-[10px]" />
      </button>
      <button
        type="button"
        onClick={() => map?.zoomOut()}
        title="Zoom Out"
        className="flex h-7 w-7 items-center justify-center text-slate-200 hover:bg-white/10 hover:text-sonar transition text-xs font-bold"
      >
        <i className="fa-solid fa-minus text-[10px]" />
      </button>
    </div>
  );
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
  const [activeBasemap, setActiveBasemap] = useState<keyof typeof BASEMAPS>("satellite");
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [cursorCoord, setCursorCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Tactical layer toggle states
  const [showFootprint, setShowFootprint] = useState(true);
  const [showSlick, setShowSlick] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showRangeRings, setShowRangeRings] = useState(true);

  function handleFocusSpill() {
    mapInstance?.flyTo([17.35, 71.9], 10, { duration: 1.2 });
  }

  function handleFocusCulprit() {
    if (selectedSuspect && selectedSuspect.track.length > 0) {
      const last = selectedSuspect.track[selectedSuspect.track.length - 1];
      mapInstance?.flyTo([last.lat, last.lon], 10.5, { duration: 1.2 });
    }
  }

  function handleResetView() {
    mapInstance?.flyTo(center, 9, { duration: 1.2 });
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none bg-slate-950">
      <MapContainer
        center={center}
        zoom={9}
        className="h-full w-full"
        zoomControl={false}
        preferCanvas
      >
        <MapBridge onReady={setMapInstance} />
        <TileLayer
          key={activeBasemap}
          attribution={BASEMAPS[activeBasemap].attribution}
          url={BASEMAPS[activeBasemap].url}
          maxZoom={18}
        />

        <MapEventsWatcher onCoordChange={setCursorCoord} />

        {/* Range rings centered at spill core */}
        <RangeRings center={[17.35, 71.9]} visible={showRangeRings} />

        {data && (
          <>
            {showFootprint && (
              <GeoJSON
                key="sar-footprint"
                data={data.sarFootprint as unknown as GeoJSON.GeoJsonObject}
                style={{ color: "#38BDF8", weight: 1.8, dashArray: "5 5", fillOpacity: 0.04, fillColor: "#38BDF8" }}
              />
            )}

            {showSlick && (
              <SlickLayer slick={data.slick} lookalikes={data.lookalikes} showLookalikes={showLookalikes} />
            )}

            {showOrigin && <OriginLayer origin={data.origin} />}
            {showForecast && <ForecastLayer forecast={data.forecast} activeHour={timelineHours} />}

            {showVessels && (
              <AisTracksLayer
                tracks={data.tracks}
                suspects={data.suspects}
                progress={Math.min(1, 0.35 + timelineHours / 48)}
                selectedMmsi={selectedSuspect?.mmsi ?? null}
                onSelectVessel={onSelectVessel}
              />
            )}

            {selectedSuspect && (
              <Polyline
                positions={trackToLatLngs(selectedSuspect.track)}
                pathOptions={{ color: "#EF4444", weight: 4.5, opacity: 1, dashArray: "6 4" }}
              />
            )}

            {showResponsePoints &&
              data.responsePoints.map((rp) => (
                <CircleMarker
                  key={rp.id}
                  center={[rp.lat, rp.lon]}
                  radius={6.5}
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

      {/* ============================================================ */}
      {/* FLOATING TOP-RIGHT: BASEMAP SELECTOR & TACTICAL ACTIONS      */}
      {/* ============================================================ */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        {/* Basemap Toggle Group */}
        <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-slate-900/90 p-1 shadow-xl backdrop-blur-md">
          {(Object.keys(BASEMAPS) as Array<keyof typeof BASEMAPS>).map((key) => {
            const b = BASEMAPS[key];
            const isActive = activeBasemap === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveBasemap(key)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  isActive
                    ? "bg-sonar text-white shadow-sm font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <i className={`fa-solid ${b.icon} text-[10px]`} />
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tactical Navigation Quick Actions */}
        <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-slate-900/85 p-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={handleFocusSpill}
            title="Focus camera on spill slick"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-white/10 hover:text-sonar transition"
          >
            <i className="fa-solid fa-crosshairs text-sonar text-[10px]" />
            <span>Spill Center</span>
          </button>
          {selectedSuspect && (
            <button
              type="button"
              onClick={handleFocusCulprit}
              title="Track culprit vessel"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/20 hover:text-white transition"
            >
              <i className="fa-solid fa-ship text-danger text-[10px]" />
              <span>Track Culprit</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetView}
            title="Reset AOI overview"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200 transition"
          >
            <i className="fa-solid fa-expand text-[10px]" />
            <span>AOI</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TACTICAL RADAR HUD TELEMETRY OVERLAY (TOP-LEFT)              */}
      {/* ============================================================ */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="flex flex-col gap-1.5 rounded-xl border border-white/20 bg-slate-900/90 px-3.5 py-2.5 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                MARITIME SURVEILLANCE RADAR
              </span>
            </div>
            <span className="font-mono text-[9px] text-slate-400">SECTOR 4 · ARABIAN SEA</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-300 border-t border-white/10 pt-1.5">
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-wind text-cyan-400 text-[10px]" />
              <span className="text-slate-400">WIND:</span>
              <span className="font-semibold text-white">14.2 kn · 315° NW</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-water text-indigo-400 text-[10px]" />
              <span className="text-slate-400">DRIFT:</span>
              <span className="font-semibold text-white">0.85 kn · 135° SE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-satellite text-amber-400 text-[10px]" />
              <span className="text-slate-400">PASS:</span>
              <span className="font-semibold text-white">SENTINEL-1A SAR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-satellite-dish text-emerald-400 text-[10px]" />
              <span className="text-slate-400">AIS STREAM:</span>
              <span className="font-semibold text-emerald-400">LIVE (40 NM AOI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FLOATING LAYER VISIBILITY TOGGLES (BOTTOM-CENTER)            */}
      {/* ============================================================ */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] hidden md:flex items-center gap-1 rounded-xl border border-white/20 bg-slate-900/90 px-2 py-1 shadow-2xl backdrop-blur-md">
        <LayerPill
          active={showFootprint}
          onClick={() => setShowFootprint(!showFootprint)}
          icon="fa-vector-square"
          label="SAR Footprint"
          activeColor="text-sky-400"
        />
        <LayerPill
          active={showSlick}
          onClick={() => setShowSlick(!showSlick)}
          icon="fa-droplet"
          label="Oil Slick"
          activeColor="text-red-400"
        />
        <LayerPill
          active={showOrigin}
          onClick={() => setShowOrigin(!showOrigin)}
          icon="fa-bullseye"
          label="Hindcast Origin"
          activeColor="text-amber-400"
        />
        <LayerPill
          active={showForecast}
          onClick={() => setShowForecast(!showForecast)}
          icon="fa-arrows-split-up-and-left"
          label="Drift Forecast"
          activeColor="text-teal-400"
        />
        <LayerPill
          active={showVessels}
          onClick={() => setShowVessels(!showVessels)}
          icon="fa-ship"
          label="AIS Vessels"
          activeColor="text-cyan-400"
        />
        <LayerPill
          active={showRangeRings}
          onClick={() => setShowRangeRings(!showRangeRings)}
          icon="fa-circle-dot"
          label="Range Rings"
          activeColor="text-emerald-400"
        />
      </div>

      {/* ============================================================ */}
      {/* FLOATING ZOOM & COORDINATES STATUS (BOTTOM-RIGHT)            */}
      {/* ============================================================ */}
      <div className="absolute bottom-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          {/* Coordinates Reticle */}
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/90 px-3 py-1.5 text-white shadow-xl backdrop-blur-md font-mono text-[10px]">
            <i className="fa-solid fa-crosshairs text-sonar text-[9px]" />
            <span className="text-slate-300">
              {cursorCoord
                ? `${cursorCoord.lat.toFixed(4)}°N, ${cursorCoord.lng.toFixed(4)}°E`
                : "17.3000°N, 71.9000°E"}
            </span>
          </div>

          {/* Custom Zoom Buttons */}
          <CustomZoomControls map={mapInstance} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAP LEGEND (BOTTOM-LEFT)                                     */}
      {/* ============================================================ */}
      <MapLegend />
    </div>
  );
}

function LayerPill({
  active,
  onClick,
  icon,
  label,
  activeColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  activeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
        active
          ? `bg-white/10 ${activeColor} shadow-sm font-bold`
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 opacity-60"
      }`}
    >
      <i className={`fa-solid ${icon} text-[9px]`} />
      <span>{label}</span>
    </button>
  );
}

function MapLegend() {
  const items: { color: string; label: string; dash?: boolean; pulse?: boolean }[] = [
    { color: "#DC2626", label: "Confirmed Oil Slick", pulse: true },
    { color: "#F59E0B", label: "Hindcast Spill Origin (T-6.2h)", pulse: true },
    { color: "#EF4444", label: "Culprit Vessel Trajectory (MT AZURE)", dash: true },
    { color: "#06B6D4", label: "Maritime AIS Traffic (Live Stream)" },
    { color: "#38BDF8", label: "Sentinel-1A SAR Footprint", dash: true },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-xl border border-white/20 bg-slate-900/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md text-white">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5 font-mono">
        <i className="fa-solid fa-layer-group text-sonar text-[9px]" /> Map Layers
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2 text-[11px] font-medium text-slate-200">
            <span
              className={`inline-block h-2 w-4 rounded-sm shrink-0 ${it.pulse ? "animate-pulse" : ""}`}
              style={{
                backgroundColor: it.color,
                backgroundImage: it.dash
                  ? `repeating-linear-gradient(90deg, ${it.color} 0 3px, transparent 3px 6px)`
                  : undefined,
                boxShadow: it.pulse ? `0 0 8px ${it.color}` : undefined,
              }}
            />
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
