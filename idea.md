# JalDrishti (जलदृष्टि) — Comprehensive Project Architecture & Technical Idea

> **DevDays Metro Hackathon Pune**  
> **Built by:** Anuja Pawar & Bhavika Patil  
> **"Detect. Trace. Attribute."**  
> An AI-Powered Ocean Intelligence & Maritime Forensic Platform for Rapid Oil Spill Detection, Hydrodynamic Origin Hindcasting, and AIS Vessel Culprit Attribution.

---

## 1. Executive Summary & Problem Statement

### The Real-World Crisis
Marine oil spills represent catastrophic ecological and economic disasters. Beyond high-profile tanker collisions, over **60% of marine oil contamination originates from deliberate, illegal operational discharges**—ships flushing oily bilge water and tank washings at night to avoid port treatment fees.

### The Critical Gap in Existing Systems
Current spaceborne surveillance systems (such as European CleanSeaNet or satellite image viewers) suffer from three fatal limitations:
1. **Passive Visualization Only:** They show *where* a slick is, but cannot answer *who* dumped it.
2. **Current-Induced Drift Displacement:** Because ocean winds and currents move the oil slick over time, the detected slick location on a satellite pass is **not** where the discharge actually took place.
3. **AIS "Dark Ships":** Rogue vessels deliberately disable their Automatic Identification System (AIS) transponders during illegal dumping, evading basic distance-based queries.

### The JalDrishti Solution
JalDrishti closes this loop by uniting **Spaceborne Radar Computer Vision**, **Hydrodynamic Drift Hindcasting (Reverse Simulation)**, and **Multi-Factor AIS Telemetry Forensics** into a single automated pipeline.

---

## 2. End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 JALDRISHTI PIPELINE                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘

    [ Step 1: Ingestion ]
    Synthetic Aperture Radar (SAR) Satellite Scene (Sentinel-1A / C-Band VV/VH)
            │
            ▼
    [ Step 2: Computer Vision Segmentation ]
    Speckle Noise Filtering (Median/Gaussian) ──► Adaptive Otsu Binarization ──► Morphological Closure
            │
            ▼
    [ Step 3: Feature Extraction & Classification ]
    Contour Vectorization ──► Geo-Referencing (Pixel ➔ WGS84) ──► Look-Alike Rejection (Algae/Wind Lulls)
    Outputs: Slick GeoJSON Polygon, Surface Area (km²), Centroid Coordinates, Perimeter
            │
            ▼
    [ Step 4: Hydrodynamic Drift Hindcast (Reverse Tracking) ]
    Displacement Vector = ∫ [ Current_Velocity(t) + Wind_Leeway_Factor(t) ] dt (Backward 4–8h)
    Outputs: Estimated Discharge Origin Coordinates & Temporal Release Window
            │
            ▼
    [ Step 5: Real-Time AIS Maritime Telemetry Ingestion ]
    Live AISstream.io WebSockets & Regional Historical Vessel Corridors
    Outputs: Spatial Filtering to ±40 nm radius around Discharge Origin
            │
            ▼
    [ Step 6: Multi-Factor Attribution Scoring Engine ]
    Proximity Scoring + AIS Blackout Penalty + Speed/Course Anomaly Analysis
            │
            ▼
    [ Step 7: Showstopper Culprit Output ]
    Ranked Culprit Evidence Card (e.g., MT AZURE HORIZON · 87–99% Match) + Legal Evidence Dossier
```

---

## 3. Core Technical Modules & Methodology

### Module A: Computer Vision & Radar Analysis (`backend/services/image_processor.py`)
* **Physical Basis:** Petroleum oil forms a dampening monomolecular viscoelastic film that suppresses high-frequency ocean capillary waves (ripples). Consequently, Synthetic Aperture Radar (SAR) pulses reflect away specularly into space rather than scattering back to the sensor, appearing as distinct **dark backscatter patches**.
* **Speckle Denoising:** Median filtering suppresses SAR "salt-and-pepper" noise while preserving crisp boundary gradients.
* **Binarization:** Combined Otsu's thresholding separates low-intensity water patches from ambient ocean backscatter.
* **Vectorization:** Traces polygonal boundaries using the Douglas-Peucker algorithm and transforms image coordinates $(x, y)$ into geospatial coordinates $(\text{Lat}, \text{Lon})$.
* **Look-Alike Rejection:** Evaluates geometric circularity, aspect ratio, and border gradients to distinguish real petroleum slicks from natural phenomena like algal blooms, internal waves, and low-wind calm zones.

### Module B: Hydrodynamic Origin Hindcasting (`backend/services/hindcast_engine.py`)
* **Physical Basis:** An oil slick drifts according to the vector sum of ambient ocean currents and wind-driven surface leeway:
  $$\vec{V}_{\text{slick}} = \vec{V}_{\text{current}} + \alpha \cdot \vec{V}_{\text{wind}} + \vec{V}_{\text{stokes}}$$
  *(Where $\alpha \approx 0.03–0.035$ is the empirical wind leeway drag coefficient).*
* **Backward Integration:** By reversing the time step ($\Delta t < 0$) from the satellite pass timestamp $T_{\text{sat}}$ back by 4–8 hours, JalDrishti reconstructs the exact **Discharge Origin Zone** and release time window $T_{\text{spill}}$.

### Module C: Multi-Factor AIS Attribution Engine (`backend/main.py`)
The system cross-references all maritime vessels intersecting the origin bounding box and calculates an **Attribution Risk Score (0–99%)**:

1. **Spatial Proximity ($S_{\text{dist}}$):**
   Calculates the Closest Point of Approach (CPA) using spherical nautical geometry:
   $$\text{Dist}_{\text{nm}} = \sqrt{(\Delta \text{Lat} \times 60)^2 + (\Delta \text{Lon} \times 60 \times \cos(\text{Lat}))^2}$$
   $$S_{\text{dist}} = \max(10, 100 - (\text{Dist}_{\text{nm}} \times 4))$$

2. **AIS Blackout / "Dark Ship" Penalty ($P_{\text{gap}}$):**
   Commercial ships are legally required to broadcast AIS positions every 2–10 seconds. If an unannounced signal blackout exceeds 30 minutes while traversing the origin zone, a **$+15$ risk penalty** is added.

3. **Speed & Course Deviation Penalty ($P_{\text{speed}}$):**
   Ships engaged in illegal underway bilge washing typically decelerate from transit speed ($14–18\text{ kn}$) down to pumping speed ($3–5\text{ kn}$) to prevent high-speed wake dilution. Course zig-zags and sudden speed drops contribute additional evidence weight.

---

## 4. Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Leaflet / React-Leaflet
* **Backend:** Python 3.14, FastAPI, Uvicorn (Asynchronous REST API)
* **Computer Vision:** OpenCV (`cv2`), NumPy, SciPy
* **Data Sources:** Sentinel-1A SAR (C-band), AISstream.io WebSockets, NOAA/DMA Maritime Historical Baselines
* **Geospatial Standards:** GeoJSON (RFC 7946), WGS84 coordinate reference system

---

## 5. Unique Innovations & Competitive Advantage

1. **Active Culprit Attribution vs. Passive Mapping:** Most tools stop at mapping. JalDrishti produces a named vessel, flag state, and MMSI.
2. **Temporal Reverse-Drift Accuracy:** Solves the drift displacement problem that misleads simple spatial searches.
3. **Explainable Forensic Proof Chain:** Rather than a black-box AI score, the dashboard shows concrete, court-admissible evidence: exact distance, blackout duration, and speed telemetry.
4. **Instant Legal Dossier Generation:** Prepares standardized Coast Guard violation briefs with a single click.

---

## 6. Future Roadmap

* Integration with Sentinel-2 optical imagery for multispectral oil thickness estimation (Bonn Agreement color codes).
* Direct Copernicus Marine Environment Monitoring Service (CMEMS) API hook for automated real-time ocean current field ingestion.
* Automated Port State Control (PSC) automated alert dispatch for vessel intercept at its next port of call.
