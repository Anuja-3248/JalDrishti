import { useEffect, useRef, useState } from "react";
import { runPipeline, getStatus, BackendStatus } from "../api/client";
import { workflowTemplate } from "../data/mockData";
import type { PipelineResponse, Suspect, WorkflowStep } from "../types";

import TopBar from "../components/layout/TopBar";
import WorkflowStepper from "../components/workflow/WorkflowStepper";
import MapView from "../components/map/MapView";
import Tabs from "../components/common/Tabs";
import Toast from "../components/common/Toast";
import TimelineSlider from "../components/timeline/TimelineSlider";

import ImageAnalysisPanel from "../components/analysis/ImageAnalysisPanel";
import AisAnalysisPanel from "../components/analysis/AisAnalysisPanel";
import SuspectsTable from "../components/vessels/SuspectsTable";
import SuspectDetailPanel from "../components/vessels/SuspectDetailPanel";
import AlertPanel from "../components/response/AlertPanel";
import ReportPanel from "../components/response/ReportPanel";
import ResponseMonitoring from "../components/response/ResponseMonitoring";

const REGIONS = [
  "Arabian Sea — Konkan Coast Sector 4",
  "Bay of Bengal — Sector 2",
  "Gulf of Mannar — Sector 1",
];

const TABS = [
  { id: "image", label: "Image" },
  { id: "ais", label: "AIS" },
  { id: "suspects", label: "Suspects" },
  { id: "alert", label: "Alert & Report" },
  { id: "response", label: "Response" },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface DashboardProps {
  onNavigateHome?: () => void;
  autoRun?: boolean;
}

export default function Dashboard({ onNavigateHome, autoRun = true }: DashboardProps) {
  const [region, setRegion] = useState(REGIONS[0]);
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>(workflowTemplate);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  const [timelineHours, setTimelineHours] = useState(0);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("image");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showLookalikes, setShowLookalikes] = useState(true);
  const [showResponsePoints, setShowResponsePoints] = useState(true);

  const hasRun = useRef(false);

  // Poll backend status for live AIS stream reception stats
  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      const status = await getStatus();
      if (mounted && status) {
        setBackendStatus(status);
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handleRunPipeline() {
    setIsRunning(true);
    setData(null);
    setSelectedMmsi(null);
    setTimelineHours(0);
    setSteps(workflowTemplate.map((s) => ({ ...s, status: "pending", timestamp: undefined })));
    setActiveStepIndex(-1);

    try {
      const resultPromise = runPipeline();

      for (let i = 0; i < workflowTemplate.length; i++) {
        setActiveStepIndex(i);
        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "active" } : s)));
        await delay(120);
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "done", timestamp: new Date().toISOString() } : s))
        );
      }

      const result = await resultPromise;
      setData(result);
      setSteps(result.workflow);
    } catch (err) {
      console.error("Pipeline run failed:", err);
    } finally {
      setIsRunning(false);
    }
  }

  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // We don't auto-run fake data on page load anymore.
  // The system starts in an authentic "Awaiting SAR Scene" state!
  useEffect(() => {
    // Awaiting user action
  }, []);

  const selectedSuspect: Suspect | null = data?.suspects.find((s) => s.mmsi === selectedMmsi) ?? null;

  function handleSelectVessel(mmsi: string) {
    setSelectedMmsi((prev) => (prev === mmsi ? null : mmsi));
    setActiveTab("suspects");
  }

  async function handleImageAnalyzed(analysis: any) {
    if (!analysis || !analysis.summary) return;
    setHasAnalyzed(true);

    let base = data;
    if (!base) {
      try {
        base = await runPipeline();
      } catch (e) {
        console.error(e);
      }
    }

    if (base) {
      setData({
        ...base,
        slick: analysis.slickGeoJSON?.features?.length ? analysis.slickGeoJSON : base.slick,
        lookalikes: analysis.lookalikesGeoJSON?.features?.length ? analysis.lookalikesGeoJSON : base.lookalikes,
        imageAnalysis: {
          ...base.imageAnalysis,
          darkPatchesDetected: analysis.patchesDetected,
          confirmedSlicks: analysis.summary.confirmedCount,
          lookAlikesRejected: analysis.summary.lookalikesCount,
          avgConfidence: analysis.summary.confidence,
          slickAreaKm2: analysis.summary.areaKm2,
        },
      });

      // Highlight the first 4 workflow steps as completed
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 3 ? { ...s, status: "done", timestamp: new Date().toISOString() } : s
        )
      );
    }

    setToastMsg(
      `SAR Scene Analyzed: ${analysis.summary.confirmedCount} slick detected (${analysis.summary.areaKm2} km²)`
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-abyss text-ink">
      <TopBar
        region={region}
        regions={REGIONS}
        onRegionChange={setRegion}
        onRunPipeline={handleRunPipeline}
        isRunning={isRunning}
        incidentId={data?.incidentId}
        liveStatus={backendStatus?.liveAis}
        onNavigateHome={onNavigateHome}
      />

      <div className="flex min-h-0 flex-1">
        <WorkflowStepper steps={steps} activeIndex={activeStepIndex} />

        <main className="relative min-w-0 flex-1">
          {!data && !isRunning && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              Run the pipeline to load a scene.
            </div>
          )}
          {isRunning && !data && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-ink-muted">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-sonar/30 border-t-sonar" />
              Processing SAR scene…
            </div>
          )}
          {data && (
            <MapView
              data={data}
              timelineHours={timelineHours}
              selectedSuspect={selectedSuspect}
              onSelectVessel={handleSelectVessel}
              showLookalikes={showLookalikes}
              showResponsePoints={showResponsePoints}
            />
          )}
        </main>

        <aside className="flex w-[340px] shrink-0 flex-col border-l border-stroke bg-panel">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "image" && (
              <ImageAnalysisPanel
                metrics={data?.imageAnalysis ?? null}
                hasAnalyzed={hasAnalyzed}
                onImageAnalyzed={handleImageAnalyzed}
              />
            )}
            {!data && activeTab !== "image" ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-raised text-sonar/70">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="mt-2 text-xs font-medium text-ink-muted">Awaiting Scene Analysis</p>
                <p className="mt-1 text-[11px] text-ink-faint">
                  Upload an image in the <b>Image</b> tab or click <b>Run Investigation</b> to populate this tab.
                </p>
              </div>
            ) : (
              <>
                {activeTab === "ais" && data && <AisAnalysisPanel metrics={data.aisAnalysis} />}
                {activeTab === "suspects" && data && (
                  <div className="flex flex-col gap-3">
                    <SuspectsTable
                      suspects={data.suspects}
                      selectedMmsi={selectedMmsi}
                      onSelect={handleSelectVessel}
                    />
                    <SuspectDetailPanel suspect={selectedSuspect} />
                  </div>
                )}
                {activeTab === "alert" && data && (
                  <div className="flex flex-col gap-4">
                    <AlertPanel alert={data.alert} onSubmit={() => setToastMsg("Alert submitted to coastal command")} />
                    <div className="border-t border-stroke pt-4">
                      <ReportPanel data={data} />
                    </div>
                  </div>
                )}
                {activeTab === "response" && data && (
                  <ResponseMonitoring
                    responsePoints={data.responsePoints}
                    forecast={data.forecast}
                    timelineHours={timelineHours}
                  />
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-stroke px-3 py-2 text-[10px] text-ink-muted">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={showLookalikes}
                onChange={(e) => setShowLookalikes(e.target.checked)}
                className="accent-sonar"
              />
              Look-alikes
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={showResponsePoints}
                onChange={(e) => setShowResponsePoints(e.target.checked)}
                className="accent-sonar"
              />
              Response assets
            </label>
          </div>
        </aside>
      </div>

      <TimelineSlider value={timelineHours} max={48} marks={[0, 6, 12, 24, 48]} onChange={setTimelineHours} />

      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />}
    </div>
  );
}
