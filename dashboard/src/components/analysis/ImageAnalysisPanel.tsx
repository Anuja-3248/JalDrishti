import { useState, useRef } from "react";
import type { ImageAnalysisMetrics } from "../../types";
import StatRow from "../common/StatRow";
import { uploadSatelliteImage } from "../../api/client";

interface ImageAnalysisPanelProps {
  metrics: ImageAnalysisMetrics | null;
  hasAnalyzed: boolean;
  onImageAnalyzed?: (analysis: any) => void;
}

const SAMPLE_SCENES = [
  {
    id: "severe",
    name: "Scene 1: Major Tanker Spill",
    file: "/samples/sample_oil_spill_severe.png",
    desc: "Heavy discharge along shipping corridor",
    badge: "Severe Spill"
  },
  {
    id: "curved",
    name: "Scene 2: Curved Coastal Slick",
    file: "/samples/sample_oil_spill_curved.png",
    desc: "Curved slick from turning vessel",
    badge: "Turning Vessel"
  },
  {
    id: "lookalike",
    name: "Scene 3: Natural Look-Alike",
    file: "/samples/sample_natural_lookalike.png",
    desc: "Low-wind calm sea & algal bloom (Rejected)",
    badge: "Look-Alike"
  }
];

export default function ImageAnalysisPanel({ metrics, hasAnalyzed, onImageAnalyzed }: ImageAnalysisPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setActiveFileName(file.name);
    setIsUploading(true);
    setUploadError(null);
    setProcessingStage("Uploading to OpenCV engine...");

    try {
      setProcessingStage("Running Otsu & speckle noise filter...");
      await new Promise(r => setTimeout(r, 200));
      
      setProcessingStage("Extracting contours & calculating area...");
      const result = await uploadSatelliteImage(file);

      if (result && result.status === "success") {
        if (onImageAnalyzed) {
          onImageAnalyzed(result);
        }
      } else {
        setUploadError("Image processed, but no valid radar features found.");
      }
    } catch (err: any) {
      console.error("Failed to process SAR image:", err);
      setUploadError("Backend connection error or processing timeout.");
    } finally {
      setIsUploading(false);
      setProcessingStage("");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  async function handleSelectSample(sample: typeof SAMPLE_SCENES[0]) {
    setIsUploading(true);
    setUploadError(null);
    setActiveFileName(sample.name);
    setProcessingStage("Loading sample SAR scene...");

    try {
      const res = await fetch(sample.file);
      const blob = await res.blob();
      const file = new File([blob], `${sample.id}.png`, { type: "image/png" });
      await processFile(file);
    } catch (err) {
      console.error("Failed to load sample image:", err);
      setUploadError("Failed to load sample file.");
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Upload SAR Scene Dropzone */}
      <div className="rounded-lg border-2 border-dashed border-stroke-strong/70 bg-surface/60 p-3 text-center transition-all hover:border-sonar hover:bg-surface">
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.tif,.tiff"
          className="hidden"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-raised text-sonar shadow-inner">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink">
              {activeFileName ? (
                <span className="text-sonar font-mono">{activeFileName}</span>
              ) : (
                "Upload Sentinel-1A Satellite Scene"
              )}
            </p>
            <p className="text-[10px] text-ink-muted">Accepts PNG, JPG, or GeoTIFF</p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-sonar/20 border border-sonar/40 px-3 py-1.5 text-xs font-semibold text-sonar transition hover:bg-sonar/30 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin text-sonar" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{processingStage || "Analyzing Pixels..."}</span>
              </>
            ) : (
              <span>📁 Browse Your Image</span>
            )}
          </button>
        </div>

        {uploadError && (
          <p className="mt-2 text-[11px] font-medium text-accent-danger">{uploadError}</p>
        )}
      </div>

      {/* Quick Test Sample Scenes */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          Or Select a Pre-Loaded Satellite Scene:
        </p>
        <div className="flex flex-col gap-1.5">
          {SAMPLE_SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={isUploading}
              onClick={() => handleSelectSample(s)}
              className="flex items-center justify-between rounded border border-stroke bg-raised/70 p-2 text-left transition hover:border-sonar/50 hover:bg-raised"
            >
              <div>
                <p className="text-[11px] font-semibold text-ink">{s.name}</p>
                <p className="text-[9.5px] text-ink-muted">{s.desc}</p>
              </div>
              <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] font-medium text-sonar">
                {s.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Real Extracted Metrics Section */}
      <div className="border-t border-stroke pt-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Extracted Satellite Properties:
          </p>
          {hasAnalyzed ? (
            <span className="inline-flex items-center gap-1 rounded bg-accent-safe/10 px-1.5 py-0.5 text-[9px] font-medium text-accent-safe">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-safe animate-pulse" />
              Live Analyzed
            </span>
          ) : (
            <span className="text-[9px] text-ink-faint">Awaiting Image</span>
          )}
        </div>

        {hasAnalyzed && metrics ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-md border border-stroke bg-raised px-3 py-2 shadow-card">
              <p className="font-mono text-[11px] font-medium text-ink-muted">{metrics.sceneId}</p>
              <p className="mt-0.5 text-xs font-semibold text-ink-dark">{metrics.satellite}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatRow label="Resolution" value={`${metrics.resolutionM} m`} />
              <StatRow label="Dark patches" value={metrics.darkPatchesDetected} />
              <StatRow label="Confirmed slicks" value={metrics.confirmedSlicks} accent="danger" />
              <StatRow label="Look-alikes rejected" value={metrics.lookAlikesRejected} accent="muted" />
              <StatRow label="Avg. confidence" value={`${(metrics.avgConfidence * 100).toFixed(0)}%`} accent="sonar" />
              <StatRow label="Slick area" value={`${metrics.slickAreaKm2} km²`} accent="danger" />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-stroke/50 bg-raised/30 p-4 text-center">
            <p className="text-xs font-medium text-ink-muted">No Image Analyzed Yet</p>
            <p className="mt-1 text-[10px] text-ink-faint">
              Upload an image above or click one of the 3 scenes to run real OpenCV segmentation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
