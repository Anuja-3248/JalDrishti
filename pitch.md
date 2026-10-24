# JalDrishti — Official Hackathon & Presentation Pitch Guide

> **Your ultimate presentation cheat-sheet:** memorizable pitches, click-by-click live demo script, and bulletproof answers to tough evaluator questions.

---

## 1. The 30-Second Elevator Pitch

> *"Respected evaluators, today, when an oil spill happens in the ocean, satellites can tell us **where** the oil is, but they cannot answer the most critical question: **'Who dumped it?'**  
> Ships dump toxic sludge under the cover of night, turn off their transponders, and sail away unpunished.  
> **JalDrishti** changes this. By combining radar satellite computer vision, reverse ocean current drift modeling, and real-time ship tracking analytics, JalDrishti traces the spill back in time to catch the culprit vessel with legal-grade forensic proof.  
> **JalDrishti doesn't just monitor the ocean — it catches the culprit.**"*

---

## 2. The 2-Minute Comprehensive Stage Pitch

> *"Good morning, esteemed jury.  
> 
> Over 60% of oil pollution in our oceans doesn't come from massive accidents like the Exxon Valdez. It comes from illegal, deliberate operational dumping—ships flushing contaminated bilge water directly into international sea lanes to save money.  
> 
> Current monitoring systems fail because of two fundamental flaws:  
> First, **ocean drift**. By the time a satellite captures an image, ocean currents have carried the slick miles away from where it was dumped. Searching near the detected slick leads to the wrong ships.  
> Second, **'Dark Ships'**. Rogue operators deliberately switch off their AIS transponders to evade detection.  
> 
> We built **JalDrishti** to solve both problems through a seamless, 3-step intelligence workflow:  
> 
> **Step 1: Automated Detection.** Using OpenCV and radar binarization on Synthetic Aperture Radar (SAR) imagery, our system strips away ocean speckle noise, measures the slick surface area, and rejects natural look-alikes like algal blooms.  
> 
> **Step 2: Hydrodynamic Hindcasting.** Instead of looking where the oil is now, our algorithm runs ocean wind and current vectors *backwards in time* to locate the exact discharge origin zone and release window.  
> 
> **Step 3: Multi-Factor Culprit Attribution.** We cross-examine all maritime traffic in that sector. Our scoring engine checks three forensic red flags:  
> 1. Did the vessel pass within 1 nautical mile of the calculated origin?  
> 2. Did its speed drop to slow dumping velocity?  
> 3. Did it suffer an unannounced AIS blackout right over the spill coordinates?  
> 
> The output is not just a graph. It is an **actionable, printable Legal Evidence Dossier** that Coast Guard authorities can use to detain the vessel at its next port of call.  
> 
> Thank you, and we welcome your questions."*

---

## 3. Live Demo Walkthrough Script (Click-by-Click)

Practice this 90-second routine with the live dashboard running at `http://localhost:5173/#dashboard`:

| Time | What to Click on Screen | What to Say Aloud |
| :--- | :--- | :--- |
| **00:00 - 00:20** | Point to the **Top Bar** showing `LIVE AIS` with the green pulsing dot. | *"Our dashboard is connected live to global maritime satellite telemetry via AISstream, actively monitoring traffic in the Arabian Sea corridor."* |
| **00:20 - 00:40** | Click **"Scene 1: Major Tanker Spill"** in the Image Analysis panel. | *"When a new SAR satellite scene arrives, our OpenCV pipeline removes radar speckle noise, segments the dark patch, and instantly validates an 18.4 km² confirmed petroleum slick on the Leaflet map."* |
| **00:40 - 01:05** | Click **"Run Pipeline"** (or watch it proceed). | *"Watch our sequential pipeline: Steps 1 through 4 validate the slick. Step 5 ingests nearby vessels. Step 6 runs hydrodynamic reverse drift physics to mark the amber Origin Zone. Step 7 flags vessel anomalies."* |
| **01:05 - 01:30** | Dashboard automatically opens the **"Suspects" Tab**. Point to **MT AZURE HORIZON (87–99% Match)**. | *"Here is our showstopper. Among all vessels, one ship stands out: MT AZURE HORIZON, a crude oil tanker. It passed 0.8 nm from the origin, went dark on AIS for 42 minutes, and dropped speed to 4.1 knots."* |
| **01:30 - 01:45** | Click **"Export Dossier"**. The official modal pops up. | *"With one click, the system compiles a complete forensic incident dossier—ready for Coast Guard command to order a vessel detention."* |

---

## 4. Tough Judge Questions & Bulletproof Answers

### Q1: *"Is this score hardcoded or real?"*
> **Answer:** *"The attribution score is dynamically calculated by our mathematical scoring formula. It computes the spherical nautical distance from each vessel's GPS coordinates to the calculated spill centroid, adjusts for temporal alignment with the release window, and applies weighted penalties for transponder blackouts and speed drops."*

### Q2: *"How do you know it's not a natural algal bloom or low-wind calm sea?"*
> **Answer:** *"Our computer vision layer includes look-alike classification. Mineral oil dampens capillary waves strongly and creates sharp, high-contrast, linear boundaries. Natural biogenic slicks and wind lulls have diffuse boundaries and low contrast ratios, which our algorithm classifies and rejects as look-alikes to prevent false alarms."*

### Q3: *"What if the ship completely turned off its AIS transponder?"*
> **Answer:** *"That deliberate blackout is one of our strongest pieces of evidence! When a vessel broadcasts its position, goes silent for 40 minutes while crossing the spill coordinates, and reappears on the other side, our algorithm detects an 'AIS Gap Anomaly' and increases its suspicion score."*

### Q4: *"Can you legally arrest a ship based on this system?"*
> **Answer:** *"JalDrishti does not issue judicial verdicts; it generates actionable forensic intelligence. It provides maritime authorities with the probable cause required to dispatch aerial surveillance for chemical sampling and issue Port State Control (PSC) inspection orders at the vessel's destination port under MARPOL Annex I."*
