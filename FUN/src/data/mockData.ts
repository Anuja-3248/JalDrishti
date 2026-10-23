import type {
  AisAnalysisMetrics,
  AlertInfo,
  ForecastSlice,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  ImageAnalysisMetrics,
  PipelineResponse,
  ResponsePoint,
  Suspect,
  VesselTrackPoint,
  WorkflowStep,
} from "../types";

// Area of interest: Arabian Sea, off the Konkan coast (demo coordinates only).
const AOI_CENTER: [number, number] = [71.85, 17.35]; // [lon, lat]

// ---------------------------------------------------------------------------
// SAR footprint
// ---------------------------------------------------------------------------
export const sarFootprint: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { sceneId: "SAR-S1A-20260827-1042" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [71.35, 17.75],
            [72.35, 17.75],
            [72.35, 16.95],
            [71.35, 16.95],
            [71.35, 17.75],
          ],
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Confirmed slick + look-alikes (dark patch validation stage)
// ---------------------------------------------------------------------------
export const slick: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "slick-001",
        confidence: 0.91,
        areaKm2: 18.4,
        classification: "confirmed_oil_slick",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [71.82, 17.42],
            [71.9, 17.4],
            [71.97, 17.34],
            [71.99, 17.27],
            [71.93, 17.22],
            [71.84, 17.23],
            [71.78, 17.29],
            [71.78, 17.37],
            [71.82, 17.42],
          ],
        ],
      },
    },
  ],
};

export const lookalikes: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "lookalike-001",
        confidence: 0.34,
        reason: "low_wind_biogenic_slick",
        areaKm2: 6.1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [71.55, 17.65],
            [71.62, 17.63],
            [71.63, 17.58],
            [71.56, 17.57],
            [71.53, 17.61],
            [71.55, 17.65],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "lookalike-002",
        confidence: 0.28,
        reason: "current_shear_zone",
        areaKm2: 4.3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.1, 17.1],
            [72.18, 17.12],
            [72.2, 17.06],
            [72.12, 17.03],
            [72.07, 17.06],
            [72.1, 17.1],
          ],
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Hindcast origin zone
// ---------------------------------------------------------------------------
export const origin: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "origin-zone",
        estimatedReleaseTime: "2026-08-27T02:10:00Z",
        method: "backward_hindcast_hycom",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [71.95, 17.2],
            [72.0, 17.19],
            [72.01, 17.14],
            [71.96, 17.12],
            [71.92, 17.15],
            [71.95, 17.2],
          ],
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Forecast plume — 0h / 6h / 12h / 24h / 48h, drifting NW and growing
// ---------------------------------------------------------------------------
function offsetRing(
  ring: [number, number][],
  dx: number,
  dy: number,
  scale: number
): [number, number][] {
  return ring.map(([x, y]) => {
    const cx = 71.9;
    const cy = 17.3;
    const sx = cx + (x - cx) * scale + dx;
    const sy = cy + (y - cy) * scale + dy;
    return [sx, sy];
  });
}

const baseRing: [number, number][] = [
  [71.82, 17.42],
  [71.9, 17.4],
  [71.97, 17.34],
  [71.99, 17.27],
  [71.93, 17.22],
  [71.84, 17.23],
  [71.78, 17.29],
  [71.78, 17.37],
  [71.82, 17.42],
];

const forecastSpecs: { hours: number; dx: number; dy: number; scale: number; area: number }[] = [
  { hours: 0, dx: 0, dy: 0, scale: 1, area: 18.4 },
  { hours: 6, dx: -0.03, dy: 0.02, scale: 1.15, area: 24.9 },
  { hours: 12, dx: -0.07, dy: 0.05, scale: 1.35, area: 33.2 },
  { hours: 24, dx: -0.16, dy: 0.11, scale: 1.7, area: 51.6 },
  { hours: 48, dx: -0.34, dy: 0.24, scale: 2.3, area: 89.7 },
];

export const forecast: ForecastSlice[] = forecastSpecs.map((spec) => {
  const feature: GeoJsonFeature<{ hours: number; areaKm2: number }> = {
    type: "Feature",
    properties: { hours: spec.hours, areaKm2: spec.area },
    geometry: {
      type: "Polygon",
      coordinates: [offsetRing(baseRing, spec.dx, spec.dy, spec.scale)],
    },
  };
  const base = new Date("2026-08-27T10:42:00Z").getTime();
  return {
    hoursFromDetection: spec.hours,
    timestamp: new Date(base + spec.hours * 3600 * 1000).toISOString(),
    polygon: feature,
  };
});

// ---------------------------------------------------------------------------
// AIS tracks — 150 vessels, 3 flagged as suspects
// ---------------------------------------------------------------------------
interface TrackSpec {
  mmsi: string;
  name: string;
  type: string;
  flag: string;
  suspect: boolean;
  start: [number, number];
  heading: number; // degrees, roughly
  speedKn: number;
  points: number;
  jitter: number;
  gapAt?: number; // index at which an AIS gap occurs
}

const trackSpecs: TrackSpec[] = [
  { mmsi: "412345001", name: "MV KONKAN STAR", type: "Tanker", flag: "IN", suspect: true, start: [72.05, 17.05], heading: 305, speedKn: 11.5, points: 10, jitter: 0.01, gapAt: 4 },
  { mmsi: "412345002", name: "MT AZURE HORIZON", type: "Tanker", flag: "PA", suspect: true, start: [72.2, 17.5], heading: 235, speedKn: 9.8, points: 10, jitter: 0.012, gapAt: 5 },
  { mmsi: "412345003", name: "MV SILVER TIDE", type: "Cargo", flag: "MH", suspect: true, start: [71.6, 16.9], heading: 20, speedKn: 13.2, points: 10, jitter: 0.008 },
  { mmsi: "412345004", name: "MV BLUE HERON", type: "Cargo", flag: "IN", suspect: false, start: [71.4, 17.7], heading: 150, speedKn: 12.0, points: 10, jitter: 0.01 },
  { mmsi: "412345005", name: "MV COASTAL RUNNER", type: "Fishing", flag: "IN", suspect: false, start: [71.9, 17.7], heading: 190, speedKn: 6.5, points: 10, jitter: 0.02 },
  { mmsi: "412345006", name: "MV GULF PIONEER", type: "Tanker", flag: "LR", suspect: false, start: [72.3, 17.2], heading: 260, speedKn: 10.4, points: 10, jitter: 0.009 },
  { mmsi: "412345007", name: "MV NAVIKA", type: "Bulk Carrier", flag: "IN", suspect: false, start: [71.3, 17.1], heading: 60, speedKn: 11.8, points: 10, jitter: 0.011 },
  { mmsi: "412345008", name: "MV DELTA WAVE", type: "Container", flag: "SG", suspect: false, start: [72.4, 16.8], heading: 300, speedKn: 15.1, points: 10, jitter: 0.01 },
  { mmsi: "412345009", name: "MV ARABIAN PEARL", type: "Tanker", flag: "PA", suspect: false, start: [71.5, 17.35], heading: 90, speedKn: 10.9, points: 10, jitter: 0.012 },
  { mmsi: "412345010", name: "MV SEA FALCON", type: "Fishing", flag: "IN", suspect: false, start: [72.0, 16.75], heading: 340, speedKn: 5.4, points: 10, jitter: 0.018 },
  { mmsi: "412345011", name: "MV OCEAN LEGACY", type: "Cargo", flag: "MT", suspect: false, start: [71.75, 16.65], heading: 10, speedKn: 12.6, points: 10, jitter: 0.01 },
  { mmsi: "412345012", name: "MV RANGER TIDE", type: "Tanker", flag: "IN", suspect: false, start: [72.5, 17.55], heading: 220, speedKn: 9.1, points: 10, jitter: 0.009 },
  { mmsi: "412345013", name: "MV WESTPORT", type: "Bulk Carrier", flag: "HK", suspect: false, start: [71.25, 16.85], heading: 45, speedKn: 13.8, points: 10, jitter: 0.011 },
  { mmsi: "412345014", name: "MV MALABAR WIND", type: "Container", flag: "IN", suspect: false, start: [69.85, 15.4], heading: 72, speedKn: 14.2, points: 10, jitter: 0.012 },
  { mmsi: "412345015", name: "MV CORAL MERIDIAN", type: "Cargo", flag: "SG", suspect: false, start: [73.5, 13.6], heading: 8, speedKn: 12.7, points: 10, jitter: 0.01 },
  { mmsi: "412345016", name: "MV SOUTHERN CROSSING", type: "Tanker", flag: "LR", suspect: false, start: [75.8, 11.8], heading: 48, speedKn: 10.8, points: 10, jitter: 0.011 },
  { mmsi: "412345017", name: "MV COASTAL LOTUS", type: "Fishing", flag: "IN", suspect: false, start: [77.45, 15.2], heading: 285, speedKn: 6.2, points: 10, jitter: 0.02 },
  { mmsi: "412345018", name: "MV EASTERN STAR", type: "Bulk Carrier", flag: "PA", suspect: false, start: [80.4, 13.1], heading: 330, speedKn: 11.9, points: 10, jitter: 0.01 },
  { mmsi: "412345019", name: "MV BAY TRADER", type: "Container", flag: "IN", suspect: false, start: [82.55, 16.9], heading: 250, speedKn: 15.4, points: 10, jitter: 0.012 },
  { mmsi: "412345020", name: "MV INDIAN HORIZON", type: "Cargo", flag: "MT", suspect: false, start: [84.35, 12.2], heading: 185, speedKn: 13.1, points: 10, jitter: 0.01 },
];

const localTrafficSpecs: TrackSpec[] = Array.from({ length: 50 }, (_, shipIndex) => {
  const lane = shipIndex % 10;
  const row = Math.floor(shipIndex / 10);
  const vesselTypes = ["Cargo", "Container", "Tanker", "Fishing"];
  const flags = ["IN", "SG", "LR", "PA", "MH"];
  return {
    mmsi: `412345${String(shipIndex + 21).padStart(3, "0")}`,
    name: `MV OCEAN TRAFFIC ${String(shipIndex + 1).padStart(2, "0")}`,
    type: vesselTypes[shipIndex % vesselTypes.length],
    flag: flags[shipIndex % flags.length],
    suspect: false,
    start: [71.55 + lane * 0.075 + (row % 2) * 0.018, 17.03 + row * 0.14 + (lane % 2) * 0.025],
    heading: 25 + ((shipIndex * 37) % 320),
    speedKn: 6.5 + (shipIndex % 10),
    points: 10,
    jitter: 0.012,
  };
});

const outerTrafficSpecs: TrackSpec[] = Array.from({ length: 80 }, (_, shipIndex) => {
  const lane = shipIndex % 10;
  const row = Math.floor(shipIndex / 10);
  const vesselTypes = ["Cargo", "Container", "Tanker", "Fishing", "Research"];
  const flags = ["IN", "SG", "LR", "PA", "MH", "OM"];
  return {
    mmsi: `412346${String(shipIndex + 1).padStart(3, "0")}`,
    name: `MV INDIAN OCEAN ${String(shipIndex + 1).padStart(2, "0")}`,
    type: vesselTypes[shipIndex % vesselTypes.length],
    flag: flags[shipIndex % flags.length],
    suspect: false,
    start: [70.85 + lane * 0.235 + (row % 2) * 0.035, 15.75 + row * 0.38 + (lane % 2) * 0.06],
    heading: 12 + ((shipIndex * 29) % 345),
    speedKn: 7 + (shipIndex % 12),
    points: 10,
    jitter: 0.02,
  };
});

const allTrackSpecs = [...trackSpecs, ...localTrafficSpecs, ...outerTrafficSpecs];

function buildTrack(spec: TrackSpec): VesselTrackPoint[] {
  const base = new Date("2026-08-26T18:00:00Z").getTime();
  const rad = (spec.heading * Math.PI) / 180;
  const dLon = Math.sin(rad) * 0.045;
  const dLat = Math.cos(rad) * 0.045;
  const pts: VesselTrackPoint[] = [];
  let [lon, lat] = spec.start;
  for (let i = 0; i < spec.points; i++) {
    const isGap = spec.gapAt !== undefined && i === spec.gapAt;
    if (!isGap) {
      pts.push({
        t: new Date(base + i * 40 * 60 * 1000).toISOString(),
        lat: Number(lat.toFixed(5)),
        lon: Number(lon.toFixed(5)),
        speedKn: Number((spec.speedKn + (Math.random() - 0.5)).toFixed(1)),
        courseDeg: Math.round(spec.heading + (Math.random() - 0.5) * 10),
      });
    }
    lon += dLon + (Math.random() - 0.5) * spec.jitter;
    lat += dLat + (Math.random() - 0.5) * spec.jitter;
  }
  return pts;
}

const builtTracks: Record<string, VesselTrackPoint[]> = {};
allTrackSpecs.forEach((spec) => {
  builtTracks[spec.mmsi] = buildTrack(spec);
});

export const tracks: GeoJsonFeatureCollection<{ mmsi: string; suspect: boolean; name: string; type: string; flag: string }> = {
  type: "FeatureCollection",
  features: allTrackSpecs.map((spec) => ({
    type: "Feature",
    properties: { mmsi: spec.mmsi, suspect: spec.suspect, name: spec.name, type: spec.type, flag: spec.flag },
    geometry: {
      type: "LineString",
      coordinates: builtTracks[spec.mmsi].map((point) => [point.lon, point.lat]),
    },
  })),
};

// ---------------------------------------------------------------------------
// Suspects with evidence
// ---------------------------------------------------------------------------
export const suspects: Suspect[] = [
  {
    mmsi: "412345001",
    vesselName: "MV KONKAN STAR",
    vesselType: "Tanker",
    flag: "IN",
    score: 87,
    distanceFromOriginNm: 3.2,
    closestApproachTime: "2026-08-27T01:52:00Z",
    aisGapDetected: true,
    aisGapDurationMin: 95,
    courseDeviationDeg: 34,
    evidence: [
      { label: "AIS transmission gap", detail: "95 min gap overlapping estimated release window", weight: "high" },
      { label: "Proximity to origin", detail: "Track passes within 3.2 nm of hindcast origin zone", weight: "high" },
      { label: "Course deviation", detail: "34° deviation from filed route shortly before gap", weight: "medium" },
      { label: "Vessel class", detail: "Tanker class consistent with cargo residue discharge profile", weight: "low" },
    ],
    track: builtTracks["412345001"],
  },
  {
    mmsi: "412345002",
    vesselName: "MT AZURE HORIZON",
    vesselType: "Tanker",
    flag: "PA",
    score: 74,
    distanceFromOriginNm: 6.8,
    closestApproachTime: "2026-08-27T02:40:00Z",
    aisGapDetected: true,
    aisGapDurationMin: 60,
    courseDeviationDeg: 18,
    evidence: [
      { label: "AIS transmission gap", detail: "60 min gap near estimated release window", weight: "high" },
      { label: "Proximity to origin", detail: "Closest approach 6.8 nm from origin zone", weight: "medium" },
      { label: "Flag state history", detail: "Flag of convenience with prior MARPOL flags on record", weight: "medium" },
    ],
    track: builtTracks["412345002"],
  },
  {
    mmsi: "412345003",
    vesselName: "MV SILVER TIDE",
    vesselType: "Cargo",
    flag: "MH",
    score: 52,
    distanceFromOriginNm: 11.4,
    closestApproachTime: "2026-08-27T03:15:00Z",
    aisGapDetected: false,
    aisGapDurationMin: 0,
    courseDeviationDeg: 6,
    evidence: [
      { label: "Transit timing", detail: "Passed near AOI within 4 hours of estimated release", weight: "medium" },
      { label: "No AIS gap", detail: "Continuous AIS transmission throughout transit", weight: "low" },
    ],
    track: builtTracks["412345003"],
  },
];

// ---------------------------------------------------------------------------
// Response monitoring points
// ---------------------------------------------------------------------------
export const responsePoints: ResponsePoint[] = [
  { id: "resp-1", type: "vessel", label: "ICG Samudra Paheredar", lat: 17.5, lon: 72.15, deployedAt: "2026-08-27T06:00:00Z", status: "on_site" },
  { id: "resp-2", type: "boom", label: "Containment Boom Alpha", lat: 17.38, lon: 71.9, deployedAt: "2026-08-27T07:30:00Z", status: "on_site" },
  { id: "resp-3", type: "skimmer", label: "Skimmer Unit 3", lat: 17.34, lon: 71.86, deployedAt: "2026-08-27T08:10:00Z", status: "en_route" },
  { id: "resp-4", type: "sample", label: "Water Sample Site B2", lat: 17.29, lon: 71.82, deployedAt: "2026-08-27T09:00:00Z", status: "complete" },
];

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------
export const imageAnalysis: ImageAnalysisMetrics = {
  sceneId: "SAR-S1A-20260827-1042",
  satellite: "Sentinel-1A (C-band, VV/VH)",
  acquiredAt: "2026-08-27T10:42:00Z",
  resolutionM: 10,
  darkPatchesDetected: 3,
  confirmedSlicks: 1,
  lookAlikesRejected: 2,
  avgConfidence: 0.91,
  slickAreaKm2: 18.4,
};

export const aisAnalysis: AisAnalysisMetrics = {
  vesselsInRegion: 150,
  tracksLoaded: 150,
  transmissionGapsFound: 2,
  vesselsMatchedToOrigin: 3,
  suspectsFlagged: 3,
  windowStart: "2026-08-26T18:00:00Z",
  windowEnd: "2026-08-27T10:42:00Z",
};

export const alert: AlertInfo = {
  alertId: "ALERT-2026-0827-014",
  severity: "high",
  issuedAt: "2026-08-27T11:05:00Z",
  region: "Arabian Sea — Konkan Coast Sector 4",
  message:
    "Confirmed oil slick (18.4 km²) detected via SAR with high-confidence vessel attribution. Coastal states and ICG regional command notified.",
};

// ---------------------------------------------------------------------------
// Workflow steps
// ---------------------------------------------------------------------------
export const workflowTemplate: WorkflowStep[] = [
  { id: "sar_collected", label: "SAR Image Collected", detail: "Sentinel-1A scene acquired over AOI", status: "pending" },
  { id: "preprocessed", label: "Image Preprocessed", detail: "Calibration, speckle filtering, land masking", status: "pending" },
  { id: "dark_patch_detected", label: "Dark Patch Detected", detail: "Segmentation flags candidate dark patches", status: "pending" },
  { id: "spill_validated", label: "Spill Validated", detail: "Look-alike suppression via texture + context model", status: "pending" },
  { id: "ais_loaded", label: "AIS Data Loaded", detail: "Vessel traffic loaded for AOI time window", status: "pending" },
  { id: "tracks_matched", label: "Vessel Tracks Matched", detail: "Tracks matched against hindcast origin zone", status: "pending" },
  { id: "anomaly_analysis", label: "Vessel Anomaly Analysis", detail: "AIS gaps, course deviation, speed anomalies scored", status: "pending" },
  { id: "report_generated", label: "Report Generation", detail: "Incident report compiled with evidence chain", status: "pending" },
  { id: "response_monitoring", label: "Response Monitoring", detail: "Cleanup assets tracked against forecast plume", status: "pending" },
];

// ---------------------------------------------------------------------------
// Full mock pipeline response builder
// ---------------------------------------------------------------------------
const regionScenarios: Record<string, {
  center: [number, number];
  slick: [number, number][];
  area: number;
  trafficBounds: { lonMin: number; lonMax: number; latMin: number; latMax: number };
}> = {
  "Arabian Sea — Konkan Coast Sector 4": {
    center: [71.85, 17.35],
    area: 18.4,
    trafficBounds: { lonMin: 70.65, lonMax: 72.45, latMin: 16.25, latMax: 18.35 },
    slick: [
      [71.82, 17.42], [71.9, 17.4], [71.97, 17.34], [71.99, 17.27],
      [71.93, 17.22], [71.84, 17.23], [71.78, 17.29], [71.78, 17.37], [71.82, 17.42],
    ],
  },
  "Bay of Bengal — Sector 2": {
    center: [88.15, 16.4],
    area: 27.8,
    trafficBounds: { lonMin: 87.65, lonMax: 89.6, latMin: 15.15, latMax: 17.65 },
    slick: [
      [88.04, 16.5], [88.12, 16.56], [88.25, 16.52], [88.32, 16.43],
      [88.27, 16.33], [88.16, 16.28], [88.05, 16.34], [88.0, 16.43], [88.04, 16.5],
    ],
  },
  "Gulf of Mannar — Sector 1": {
    center: [79.25, 9.05],
    area: 11.6,
    trafficBounds: { lonMin: 78.35, lonMax: 79.65, latMin: 7.25, latMax: 10.25 },
    slick: [
      [79.15, 9.12], [79.21, 9.17], [79.3, 9.15], [79.36, 9.08],
      [79.33, 8.99], [79.24, 8.95], [79.16, 8.99], [79.12, 9.06], [79.15, 9.12],
    ],
  },
};

function translatePoint([lon, lat]: [number, number], from: [number, number], to: [number, number]): [number, number] {
  return [lon + to[0] - from[0], lat + to[1] - from[1]];
}

function scenarioGeometry<T extends GeoJsonFeatureCollection>(
  collection: T,
  from: [number, number],
  to: [number, number]
): T {
  return {
    ...collection,
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates:
          feature.geometry.type === "Point"
            ? translatePoint(feature.geometry.coordinates, from, to)
            : feature.geometry.type === "LineString"
              ? feature.geometry.coordinates.map((point) => translatePoint(point, from, to))
              : feature.geometry.type === "Polygon"
                ? feature.geometry.coordinates.map((ring) => ring.map((point) => translatePoint(point, from, to)))
                : feature.geometry.coordinates.map((polygon) =>
                    polygon.map((ring) => ring.map((point) => translatePoint(point, from, to)))
                  ),
      },
    })),
  } as T;
}

function seededValue(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function buildOffshoreTraffic(
  collection: GeoJsonFeatureCollection<{ mmsi: string; suspect: boolean; name: string; type: string; flag: string }>,
  scenario: (typeof regionScenarios)[string]
): GeoJsonFeatureCollection<{ mmsi: string; suspect: boolean; name: string; type: string; flag: string }> {
  const { lonMin, lonMax, latMin, latMax } = scenario.trafficBounds;
  return {
    ...collection,
    features: collection.features.map((feature, featureIndex) => {
      if (feature.properties.suspect || feature.geometry.type !== "LineString") return feature;

      const margin = 0.16;
      const isArabianSeaRightLane = scenario === regionScenarios["Arabian Sea — Konkan Coast Sector 4"] && featureIndex % 4 === 0;
      const startLon = isArabianSeaRightLane
        ? 72.38 + seededValue(featureIndex + 101) * 0.1
        : lonMin + margin + seededValue(featureIndex + 101) * (lonMax - lonMin - margin * 2);
      const startLat = latMin + margin + seededValue(featureIndex + 307) * (latMax - latMin - margin * 2);
      const heading = isArabianSeaRightLane
        ? 200 + Math.floor(seededValue(featureIndex + 701) * 140)
        : Math.floor(seededValue(featureIndex + 701) * 360);
      const stepSize = scenario === regionScenarios["Arabian Sea — Konkan Coast Sector 4"] ? 0.008 : 0.012;
      const radians = (heading * Math.PI) / 180;
      const coordinates = feature.geometry.coordinates.map((_, pointIndex) => [
        startLon + Math.sin(radians) * pointIndex * stepSize,
        startLat + Math.cos(radians) * pointIndex * stepSize,
      ] as [number, number]);

      return { ...feature, geometry: { type: "LineString", coordinates } };
    }),
  };
}

export function mockPipelineResponse(selectedRegion = "Arabian Sea — Konkan Coast Sector 4"): PipelineResponse {
  const scenario = regionScenarios[selectedRegion] ?? regionScenarios["Arabian Sea — Konkan Coast Sector 4"];
  const baseCenter = regionScenarios["Arabian Sea — Konkan Coast Sector 4"].center;
  const now = new Date();
  const completedWorkflow: WorkflowStep[] = workflowTemplate.map((step, i) => ({
    ...step,
    status: "done",
    timestamp: new Date(now.getTime() - (workflowTemplate.length - i) * 4 * 60 * 1000).toISOString(),
  }));

  const scenarioSlick: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: { id: `slick-${selectedRegion.slice(0, 3).toLowerCase()}`, confidence: 0.91, areaKm2: scenario.area, classification: "confirmed_oil_slick" },
      geometry: { type: "Polygon", coordinates: [scenario.slick] },
    }],
  };

  const shift = <T extends GeoJsonFeatureCollection>(collection: T) => scenarioGeometry(collection, baseCenter, scenario.center);
  const shiftedTracks = buildOffshoreTraffic(shift(tracks), scenario);
  const shiftedSuspects = suspects.map((suspect) => ({
    ...suspect,
    track: suspect.track.map((point) => ({ ...point, lon: point.lon + scenario.center[0] - baseCenter[0], lat: point.lat + scenario.center[1] - baseCenter[1] })),
  }));

  return {
    incidentId: `INC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`,
    region: selectedRegion,
    workflow: completedWorkflow,
    imageAnalysis: { ...imageAnalysis, sceneId: `SAR-${selectedRegion.slice(0, 3).toUpperCase()}-${now.getTime()}`, slickAreaKm2: scenario.area },
    aisAnalysis: { ...aisAnalysis, vesselsInRegion: 150, tracksLoaded: 150 },
    sarFootprint,
    slick: scenarioSlick,
    lookalikes: shift(lookalikes),
    origin: shift(origin),
    forecast: forecast.map((slice) => ({ ...slice, polygon: scenarioGeometry({ type: "FeatureCollection", features: [slice.polygon] }, baseCenter, scenario.center).features[0] })),
    suspects: shiftedSuspects,
    tracks: shiftedTracks,
    responsePoints: responsePoints.map((point) => ({ ...point, lon: point.lon + scenario.center[0] - baseCenter[0], lat: point.lat + scenario.center[1] - baseCenter[1] })),
    alert: { ...alert, region: selectedRegion, message: `Confirmed oil slick (${scenario.area} km²) detected via SAR with high-confidence vessel attribution. Coastal states and ICG regional command notified.` },
  };
}

export const aoiCenter = AOI_CENTER;
