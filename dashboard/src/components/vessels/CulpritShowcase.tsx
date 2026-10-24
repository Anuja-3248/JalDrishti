import { useState } from "react";
import type { Suspect } from "../../types";

interface CulpritShowcaseProps {
  suspects: Suspect[];
  selectedMmsi: string | null;
  onSelect: (mmsi: string) => void;
  incidentId?: string;
  slickAreaKm2?: number;
}

export default function CulpritShowcase({
  suspects,
  selectedMmsi,
  onSelect,
  incidentId = "SAR-IND-2026-0881",
  slickAreaKm2 = 18.4,
}: CulpritShowcaseProps) {
  const [showDossierModal, setShowDossierModal] = useState(false);
  const ranked = [...suspects].sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke bg-surface/50 p-6 text-center text-xs text-ink-faint">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-raised text-sonar">
          <i className="fa-solid fa-ship text-lg" />
        </div>
        <p className="mt-2 font-medium text-ink">Awaiting Vessel Telemetry</p>
        <p className="mt-1 text-[11px] text-ink-muted">
          Run the investigation pipeline or analyze a SAR scene to calculate vessel proximity.
        </p>
      </div>
    );
  }

  const primaryCulprit = ranked[0];
  const secondaryVessels = ranked.slice(1);
  const isPrimarySelected = selectedMmsi === primaryCulprit.mmsi;

  return (
    <div className="flex flex-col gap-3">
      {/* Header Info */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
          <i className="fa-solid fa-magnifying-glass-location text-sonar" />
          Attribution Forensics
        </span>
        <span className="rounded bg-danger/10 px-2 py-0.5 font-mono text-[10px] font-bold text-danger border border-danger/30">
          1 High Risk Match
        </span>
      </div>

      {/* ============================================================ */}
      {/* SHOWSTOPPER CARD #1: PRIMARY CULPRIT                          */}
      {/* ============================================================ */}
      <div
        onClick={() => onSelect(primaryCulprit.mmsi)}
        className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${
          isPrimarySelected
            ? "border-danger/70 bg-gradient-to-b from-danger/15 via-raised/70 to-panel shadow-[0_4px_24px_rgba(239,68,68,0.18)]"
            : "border-danger/30 bg-raised/40 hover:border-danger/50 hover:bg-raised/60"
        }`}
      >
        {/* Glow Accent Top Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-danger via-amber-500 to-danger" />

        <div className="p-3.5">
          {/* Header & Badges */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-danger animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-danger font-mono">
                  Primary Suspect · Rank #1
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-ink-dark flex items-center gap-2">
                <i className="fa-solid fa-ship text-danger text-sm" />
                {primaryCulprit.vesselName}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                {primaryCulprit.vesselType} · Flag {primaryCulprit.flag} · MMSI {primaryCulprit.mmsi}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-danger/50 bg-danger/15 px-3 py-1.5 shadow-inner">
              <span className="font-mono text-xl font-black text-danger leading-none">
                {primaryCulprit.score}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-danger/90 mt-0.5">
                Match
              </span>
            </div>
          </div>

          {/* 3 Clear Forensic Proof Points */}
          <div className="mt-3.5 flex flex-col gap-2 rounded-lg border border-stroke/70 bg-panel/80 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Forensic Evidence Chain
            </p>

            {/* Proof 1: Proximity & Window */}
            <div className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-danger/20 text-danger text-[10px]">
                <i className="fa-solid fa-location-crosshairs" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-dark text-[11px]">
                  Spatiotemporal Intersection
                </p>
                <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                  Track passed within <strong className="text-danger font-mono">{primaryCulprit.distanceFromOriginNm} nm</strong> of estimated spill origin during the active release window.
                </p>
              </div>
            </div>

            {/* Proof 2: AIS Gap / Dark Window */}
            <div className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-500 text-[10px]">
                <i className="fa-solid fa-satellite-dish" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-dark text-[11px]">
                  AIS Transponder Blackout
                </p>
                <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                  {primaryCulprit.aisGapDetected ? (
                    <>
                      Signal went silent for <strong className="text-amber-500 font-mono">{primaryCulprit.aisGapDurationMin} mins</strong> while crossing the discharge coordinates.
                    </>
                  ) : (
                    "Telemetry tracked continuously across the corridor."
                  )}
                </p>
              </div>
            </div>

            {/* Proof 3: Speed & Course Deviation */}
            <div className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-sonar/20 text-sonar text-[10px]">
                <i className="fa-solid fa-gauge-simple-high" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-dark text-[11px]">
                  Speed &amp; Course Anomaly
                </p>
                <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                  Course deviation of <strong className="text-sonar font-mono">{primaryCulprit.courseDeviationDeg}°</strong> with speed drop consistent with slow underway bilge discharge.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(primaryCulprit.mmsi);
              }}
              className="flex-1 rounded-md border border-sonar/40 bg-sonar/10 py-1.5 text-center text-[11px] font-semibold text-sonar transition hover:bg-sonar/20"
            >
              <i className="fa-solid fa-crosshairs mr-1" /> Focus on Map
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDossierModal(true);
              }}
              className="flex-1 rounded-md bg-danger py-1.5 text-center text-[11px] font-semibold text-white shadow-sm transition hover:bg-danger/90"
            >
              <i className="fa-solid fa-file-shield mr-1" /> Export Dossier
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECONDARY VESSELS: CLEARED CANDIDATES                        */}
      {/* ============================================================ */}
      {secondaryVessels.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint px-0.5">
            Secondary Vessels (Cleared)
          </p>

          {secondaryVessels.slice(0, 3).map((v, i) => {
            const isSelected = selectedMmsi === v.mmsi;
            return (
              <div
                key={v.mmsi}
                onClick={() => onSelect(v.mmsi)}
                className={`flex items-center justify-between rounded-lg border p-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "border-sonar/50 bg-sonar/10 font-medium"
                    : "border-stroke/60 bg-cream-light/60 hover:bg-raised/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-ink-faint">#{i + 2}</span>
                  <div>
                    <p className="font-semibold text-ink-dark text-[11px]">{v.vesselName}</p>
                    <p className="font-mono text-[10px] text-ink-muted">
                      {v.distanceFromOriginNm} nm away · {v.vesselType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-muted border border-stroke/50">
                    {v.score}%
                  </span>
                  <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    Cleared
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* OFFICIAL EVIDENCE DOSSIER MODAL                              */}
      {/* ============================================================ */}
      {showDossierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowDossierModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-xl border border-danger/40 bg-panel p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stroke pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-danger px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                    CONFIDENTIAL EVIDENCE DOSSIER
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint">{incidentId}</span>
                </div>
                <h2 className="mt-1.5 font-display text-lg font-bold text-ink-dark">
                  Marine Spill Legal Attribution Brief
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="rounded-md p-1 text-ink-muted hover:bg-raised hover:text-ink-dark"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface/70 p-3 border border-stroke/60 font-mono text-[11px]">
                <div>
                  <span className="text-ink-faint block text-[10px]">INCIDENT ID</span>
                  <span className="font-bold text-ink-dark">{incidentId}</span>
                </div>
                <div>
                  <span className="text-ink-faint block text-[10px]">SPILL SURFACE AREA</span>
                  <span className="font-bold text-ink-dark">{slickAreaKm2} km²</span>
                </div>
                <div>
                  <span className="text-ink-faint block text-[10px]">SUSPECT VESSEL</span>
                  <span className="font-bold text-danger">{primaryCulprit.vesselName}</span>
                </div>
                <div>
                  <span className="text-ink-faint block text-[10px]">MMSI / FLAG</span>
                  <span className="font-bold text-ink-dark">{primaryCulprit.mmsi} · {primaryCulprit.flag}</span>
                </div>
              </div>

              <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
                <h4 className="font-bold text-danger text-xs mb-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation" /> Violation Summary &amp; Grounds
                </h4>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Hydrodynamic reverse hindcast models identify a release origin consistent with the trajectory of{" "}
                  <strong>{primaryCulprit.vesselName}</strong>. AIS telemetry indicates an unexplained transponder blackout of{" "}
                  <strong>{primaryCulprit.aisGapDurationMin} minutes</strong> coinciding with passing within{" "}
                  <strong>{primaryCulprit.distanceFromOriginNm} nm</strong> of the slick origin at discharge time.
                </p>
              </div>

              <div className="rounded-lg bg-raised/50 p-2.5 border border-stroke/60 text-[11px] text-ink-muted">
                <span className="font-semibold text-ink-dark block mb-1">Recommended Enforcement Action:</span>
                • Transmit urgent notice to Regional Coast Guard Command.<br />
                • Flag vessel MMSI {primaryCulprit.mmsi} for Port State Control (PSC) inspection at next destination.<br />
                • Dispatch maritime patrol aircraft for physical bilge residue sampling.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-stroke pt-3">
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="rounded-md border border-stroke px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-raised"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 rounded-md bg-sonar px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sonar-dim"
              >
                <i className="fa-solid fa-print" /> Print / Save PDF Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
