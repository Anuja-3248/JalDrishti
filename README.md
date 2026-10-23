# Marine Oil Spill Investigation Dashboard – Frontend

Smart India Hackathon 2026 – Frontend Repository (React + TypeScript + Leaflet)

## Overview

This repository contains the **frontend only** for a Marine Oil Spill Investigation Dashboard. The system helps analysts:

- Detect oil slicks from SAR satellite imagery  
- Hindcast the likely origin and forecast future drift  
- Attribute the spill to vessels using AIS data  
- Generate incident reports and simulated alerts  
- Monitor spill response activities  

The backend (ML models, drift simulation, AIS processing) is **mocked** in this frontend demo.

***

## Features

- Interactive map (Leaflet) with layers for:
  - SAR image footprint
  - Detected dark patches
  - Confirmed oil slick polygon
  - Look-alike regions (rejected)
  - Hindcast origin zone
  - Time-animated forecast plume
  - AIS vessel tracks (normal + suspects highlighted)
  - Response/cleanup points (demo)
- Step-by-step investigation workflow panel:
  - SAR Image Collected
  - Image Preprocessed
  - Dark Patch Detected
  - Spill Validated
  - AIS Data Loaded
  - Vessel Tracks Matched
  - Vessel Anomaly Analysis
  - Report Generation
  - Response Monitoring
- Analysis panels:
  - Image analysis metrics (patches, confidence, look-alikes)
  - AIS analysis metrics (vessels, gaps, matches)
  - Ranked suspect table with evidence
  - Suspect detail view (track, speed, course, anomalies)
  - Alert & report generation (simulated)
  - Response monitoring (forecast vs observed, cleanup points)
- Timeline slider to animate forecast and AIS tracks over time.

***

## Tech Stack

- **Framework:** React 18 + Vite  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **Maps:** Leaflet + react-leaflet  
- **HTTP client:** Axios (mocked API calls)  
- **State management:** React Context + local state  

***

## Prerequisites

- Node.js 18+  
- npm or yarn  

***

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd marine-oil-spill-frontend

# Install dependencies
npm install
```

***

## Development

```bash
# Start development server
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.

***

## Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory.

***

## Project Structure

```text
src/
  main.tsx
  App.tsx

  pages/
    Dashboard.tsx

  components/
    layout/
      TopBar.tsx
      Sidebar.tsx

    workflow/
      WorkflowStepper.tsx
      StepStatus.tsx

    map/
      MapView.tsx
      SlickLayer.tsx
      LookAlikeLayer.tsx
      OriginLayer.tsx
      ForecastLayer.tsx
      AisTracksLayer.tsx
      ResponseLayer.tsx

    analysis/
      ImageAnalysisPanel.tsx
      AisAnalysisPanel.tsx
      EvidencePanel.tsx
      MetricsCards.tsx

    vessels/
      SuspectsTable.tsx
      SuspectDetailPanel.tsx
      VesselTrackChart.tsx

    response/
      AlertPanel.tsx
      ReportPanel.tsx
      ResponseMonitoring.tsx

    timeline/
      TimelineSlider.tsx

  api/
    client.ts

  data/
    mockData.ts

  context/
    InvestigationContext.tsx

  utils/
    geoHelpers.ts
    formatters.ts

  index.css
  vite-env.d.ts
```

***

## Mock API

All API calls are mocked in `src/api/client.ts`. The main endpoint is:

```text
POST /api/run-pipeline
```

It returns a single JSON object containing:

- `incident_id`
- `workflow` status flags
- `slick` GeoJSON
- `lookalikes` GeoJSON
- `origin` GeoJSON
- `forecast` GeoJSON (time-sliced)
- `suspects` array (with score, distance, evidence, etc.)
- `tracks` GeoJSON
- `alert` info

To integrate a real backend later, replace the mock implementation in `client.ts` with real HTTP calls.

***

## Usage Flow (Demo)

1. Open the app in the browser.  
2. Click **“Run Pipeline”** (or it can auto-run on load).  
3. Watch the workflow steps turn green as each stage “completes”.  
4. Explore:
   - Slick polygon and look-alikes on the map  
   - Origin zone and forecast plume  
   - AIS tracks and highlighted suspect vessels  
5. Click a suspect in the table to:
   - Highlight its track on the map  
   - View detailed evidence and behavior metrics  
6. Click **“Generate Report”** to see a summary modal.  
7. Click **“Submit Alert”** to simulate sending an alert.  
8. Use the **timeline slider** to animate forecast and vessel movement.  

***

## Configuration

- Tailwind configuration: `tailwind.config.js`  
- Vite configuration: `vite.config.ts`  
- Environment variables (if needed later): `.env` (not required for the mock demo)  

***



***

## License

This frontend is created for Smart India Hackathon 2026. Use and adapt as needed for your team’s submission.

***
