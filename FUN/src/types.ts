// Lightweight GeoJSON typing (kept local to avoid an extra dependency).
export type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

export interface GeoJsonFeature<P = Record<string, unknown>> {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: P;
}

export interface GeoJsonFeatureCollection<P = Record<string, unknown>> {
  type: "FeatureCollection";
  features: GeoJsonFeature<P>[];
}

// ---- Workflow ----
export type WorkflowStepId =
  | "sar_collected"
  | "preprocessed"
  | "dark_patch_detected"
  | "spill_validated"
  | "ais_loaded"
  | "tracks_matched"
  | "anomaly_analysis"
  | "report_generated"
  | "response_monitoring";

export type WorkflowStatus = "pending" | "active" | "done" | "failed";

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  detail: string;
  status: WorkflowStatus;
  timestamp?: string;
}

// ---- Image analysis ----
export interface ImageAnalysisMetrics {
  sceneId: string;
  satellite: string;
  acquiredAt: string;
  resolutionM: number;
  darkPatchesDetected: number;
  confirmedSlicks: number;
  lookAlikesRejected: number;
  avgConfidence: number;
  slickAreaKm2: number;
}

// ---- AIS analysis ----
export interface AisAnalysisMetrics {
  vesselsInRegion: number;
  tracksLoaded: number;
  transmissionGapsFound: number;
  vesselsMatchedToOrigin: number;
  suspectsFlagged: number;
  windowStart: string;
  windowEnd: string;
}

// ---- Vessels / suspects ----
export interface EvidenceItem {
  label: string;
  detail: string;
  weight: "high" | "medium" | "low";
}

export interface VesselTrackPoint {
  t: string; // ISO timestamp
  lat: number;
  lon: number;
  speedKn: number;
  courseDeg: number;
}

export interface Suspect {
  mmsi: string;
  vesselName: string;
  vesselType: string;
  flag: string;
  score: number; // 0-100
  distanceFromOriginNm: number;
  closestApproachTime: string;
  aisGapDetected: boolean;
  aisGapDurationMin: number;
  courseDeviationDeg: number;
  evidence: EvidenceItem[];
  track: VesselTrackPoint[];
}

// ---- Alert / report ----
export interface AlertInfo {
  alertId: string;
  severity: "low" | "moderate" | "high" | "critical";
  issuedAt: string;
  region: string;
  message: string;
}

export interface ReportSummary {
  incidentId: string;
  generatedAt: string;
  slickAreaKm2: number;
  topSuspect: string;
  topSuspectScore: number;
  evidenceCount: number;
  recommendedAction: string;
}

// ---- Response monitoring ----
export interface ResponsePoint {
  id: string;
  type: "vessel" | "boom" | "skimmer" | "sample";
  label: string;
  lat: number;
  lon: number;
  deployedAt: string;
  status: "en_route" | "on_site" | "complete";
}

// ---- Forecast (time-sliced) ----
export interface ForecastSlice {
  hoursFromDetection: number;
  timestamp: string;
  polygon: GeoJsonFeature<{ hours: number; areaKm2: number }>;
}

// ---- Full pipeline response ----
export interface PipelineResponse {
  incidentId: string;
  region: string;
  workflow: WorkflowStep[];
  imageAnalysis: ImageAnalysisMetrics;
  aisAnalysis: AisAnalysisMetrics;
  sarFootprint: GeoJsonFeatureCollection;
  slick: GeoJsonFeatureCollection;
  lookalikes: GeoJsonFeatureCollection;
  origin: GeoJsonFeatureCollection;
  forecast: ForecastSlice[];
  suspects: Suspect[];
  tracks: GeoJsonFeatureCollection<{ mmsi: string; suspect: boolean; name: string; type: string; flag: string }>;
  responsePoints: ResponsePoint[];
  alert: AlertInfo;
}
