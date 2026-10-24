# MARINTEL — Marine Oil Spill Investigation Dashboard

Built by Anuja Pawar & Bhavika Patil for DevDays Metro Hackathon Pune: detect oil
spills from SAR imagery, hindcast/forecast drift, and attribute spills to
vessels using AIS data.

## Stack

React 18 + TypeScript + Vite, Tailwind CSS, react-leaflet / Leaflet, Axios
(with a local mock adapter — see `src/api/client.ts`).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. The pipeline runs automatically on load;
use **Run Pipeline** in the top bar to re-run it.

## What's mocked

`src/data/mockData.ts` contains a single synthetic SAR scene over the
Arabian Sea (Konkan coast, demo coordinates only): one confirmed slick, two
rejected look-alikes, a hindcast origin zone, five forecast time-slices
(0h/6h/12h/24h/48h), 13 AIS vessel tracks (3 flagged as suspects, 2 with
AIS transmission gaps), and four response/cleanup assets.
`src/api/client.ts` wires this into an axios instance via a custom adapter,
so the rest of the app calls `runPipeline()` exactly like it would call a
real `/run-pipeline` endpoint.

## Structure

```
src/
  api/client.ts               mocked axios client
  data/mockData.ts            all mock GeoJSON + JSON
  types.ts                    shared domain types
  pages/Dashboard.tsx         main (only) page — layout + state
  components/
    layout/TopBar.tsx
    workflow/WorkflowStepper.tsx
    map/  MapView, SlickLayer, OriginLayer, ForecastLayer, AisTracksLayer
    analysis/  ImageAnalysisPanel, AisAnalysisPanel
    vessels/  SuspectsTable, SuspectDetailPanel
    response/  AlertPanel, ReportPanel, ResponseMonitoring
    timeline/TimelineSlider.tsx
    common/  Tabs, Toast, StatRow
```

## Notes for extending

- Swap `src/api/client.ts`'s adapter for a real `baseURL` + backend call —
  the rest of the app is already written against `runPipeline(): Promise<PipelineResponse>`
  and doesn't need to change.
- The right sidebar's "Evidence chain" lives inside `SuspectDetailPanel`
  rather than as a separate tab, since it's always evidence *for* a
  specific suspect — splitting it out just meant re-selecting the same
  suspect twice.
