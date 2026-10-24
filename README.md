# JalDrishti (जलदृष्टि) — Ocean Oil Spill Intelligence & Forensic Attribution Platform

> **Smart India Hackathon (SIH 2026)**  
> **Tagline:** Detect. Trace. Attribute.  
> **Core Mission:** Automated spaceborne oil spill detection, hydrodynamic origin hindcasting, and explainable AIS vessel culprit attribution.

---

## 🌊 Overview

**JalDrishti** is an end-to-end maritime intelligence platform designed for Coast Guards, maritime surveillance agencies, and environmental regulators. While conventional satellite systems only show where an oil spill has drifted, **JalDrishti answers the hardest question: "Who dumped it, and where is the proof?"**

The system bridges Synthetic Aperture Radar (SAR) computer vision with hydrodynamic backward drift modeling and real-time maritime AIS telemetry to identify culprit vessels with court-admissible forensic evidence.

---

## 🚀 Key Features

### 1. Spaceborne SAR Ingestion & Computer Vision (`backend/services/image_processor.py`)
* **Real OpenCV Denoising & Segmentation:** Removes radar speckle noise using median filtering and segments low-backscatter oil patches via adaptive Otsu binarization.
* **Morphological Analysis:** Automatically extracts surface area ($\text{km}^2$), perimeter, centroid coordinates ($\text{Lat}, \text{Lon}$), and orientation axis.
* **Look-Alike Suppression:** Evaluates contrast ratios and geometric aspect ratios to distinguish real petroleum slicks from natural look-alikes (algal blooms, low-wind calm sea).
* **3 Pre-calibrated Benchmark Scenes:** Includes preloaded radar scenes for major spills, turning vessels, and natural look-alikes.

### 2. Hydrodynamic Drift Hindcasting (Reverse Tracking)
* Reverses ocean wind and current vectors backwards in time (4–8 hours prior to satellite overpass) to pinpoint the exact **Discharge Origin Zone** and release time window.

### 3. Live Global AIS Telemetry Streaming (`AISstream.io`)
* Live WebSocket connection to `stream.aisstream.io` ingesting real-time vessel positions globally.
* Intelligent **40-nautical-mile spatial proximity filter** centered on the spill origin to focus strictly on relevant maritime corridor traffic.

### 4. The "Showstopper" Culprit Attribution Engine (`CulpritShowcase.tsx`)
* **Dynamic Scoring Algorithm (0–99%):** Evaluates vessels on nautical Euclidean proximity, temporal overlap, speed variations, and transponder blackout duration.
* **Featured #1 Culprit Card:** Highlights the primary suspect (e.g. `MT AZURE HORIZON`, 87–99% match) with 3 undeniable forensic proofs:
  1. 📍 **Spatiotemporal Intersection:** Passed within $0.8\text{ nm}$ of origin during the active spill window.
  2. 📡 **AIS "Dark Window" Blackout:** Transponder silence for 42 minutes over the discharge coordinates.
  3. 📉 **Speed & Course Anomaly:** Sudden deceleration from $14.2\text{ kn} \to 4.1\text{ kn}$ (bilge pumping rate).
* **Cleared Secondary Vessels:** Compact cards showing why neighboring ships were cleared of suspicion.

### 5. 1-Click Legal Evidence Dossier
* Generates an official, printable **Marine Spill Legal Attribution Brief** formatted for Coast Guard enforcement and Port State Control (PSC) detention orders.

### 6. Interactive Geospatial Console (Leaflet)
* Rendered on OpenStreetMap basemaps with high-contrast tactical styling.
* Real-time animated dashed trajectories on suspect vessels, pulsing radar origin ping markers, and time-scrubbed drift animation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Plus Jakarta Sans, JetBrains Mono |
| **Interactive Maps** | Leaflet, React-Leaflet, GeoJSON (RFC 7946) |
| **Backend API** | Python 3.14, FastAPI, Uvicorn (Asynchronous REST API) |
| **Computer Vision** | OpenCV (`cv2`), NumPy, SciPy |
| **Maritime Streaming** | AISstream.io WebSockets, NOAA/DMA Historical Datasets |

---

## 📂 Project Architecture

```
JalDrishti/
├── backend/                        # FastAPI Python Backend
│   ├── data/                       # Benchmark scenes & maritime AIS samples
│   ├── services/
│   │   ├── image_processor.py      # OpenCV SAR segmentation & contour analysis
│   │   └── hindcast_engine.py      # Hydrodynamic backward drift simulation
│   ├── main.py                     # REST endpoints & AISstream WebSocket listener
│   └── requirements.txt            # Python dependencies
├── dashboard/                      # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/           # Image & AIS analysis panels
│   │   │   ├── map/                # Leaflet layers (Slick, Origin, AIS tracks)
│   │   │   ├── vessels/            # CulpritShowcase & evidence cards
│   │   │   └── workflow/           # Sequential stepper pipeline
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Main investigation console
│   │   │   └── LandingPage.tsx     # JalDrishti portal & intro
│   │   └── App.tsx                 # Unified routing between portal & dashboard
│   ├── package.json
│   └── vite.config.ts
├── idea.md                         # Detailed project technical idea & architecture
├── pitch.md                        # Presentation scripts & judge Q&A guide
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js 18+** & **npm**
* **Python 3.10+** (Python 3.14 supported)

### 1. Clone & Setup Backend
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Add your free AISstream.io API key in backend/.env
# AISSTREAM_API_KEY=your_key_here

# Launch FastAPI backend (Port 8000)
python -m uvicorn main:app --port 8000 --host 127.0.0.1
```

### 2. Setup & Launch Frontend
In a new terminal:
```bash
# Navigate to dashboard
cd dashboard

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

### 3. Open in Browser
Visit **[http://localhost:5173/#dashboard](http://localhost:5173/#dashboard)** to open the Investigation Console.  
Visit **[http://localhost:5173/](http://localhost:5173/)** to view the Landing Page Portal.

---

## 🎯 Presentation & Demonstration Guide

* Check out [pitch.md](pitch.md) for the **30-second elevator pitch**, **2-minute stage pitch**, and **click-by-click live demo script**.
* Check out [idea.md](idea.md) for the **comprehensive technical architecture and mathematical formulas**.

---

## 📜 Legal & Compliance Notice

This platform is designed to generate forensic investigative intelligence to support maritime authorities. In compliance with MARPOL Annex I regulations, legal vessel attribution requires physical chemical fingerprinting (GC-MS) of bilge residue to complement spatiotemporal AIS correlation.
