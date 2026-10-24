import React, { useEffect, useRef, useState } from "react";
import "./LandingPage.css";

interface LandingPageProps {
  onLaunchDashboard: (options?: { startPipelineImmediately?: boolean }) => void;
}

export default function LandingPage({ onLaunchDashboard }: LandingPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [analystName, setAnalystName] = useState("Officer Sarah Jenkins");
  const [agency, setAgency] = useState("Indian Coast Guard & Maritime Protection");
  const [email, setEmail] = useState("sarah.jenkins@coastguard.gov.in");
  const [activeStep, setActiveStep] = useState(1);
  const [hudCoords, setHudCoords] = useState("17.42° N · 71.95° E");

  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Ocean Wave Canvas Engine
  useEffect(() => {
    function setupWaveCanvas(canvas: HTMLCanvasElement | null) {
      if (!canvas) return () => {};
      const ctx = canvas.getContext("2d");
      if (!ctx) return () => {};

      let animationFrameId: number;
      let t = 0;

      function resize() {
        if (!canvas) return;
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || 400;
      }
      resize();
      window.addEventListener("resize", resize);

      const waves = Array.from({ length: 5 }, (_, i) => ({
        amp: 30 + i * 12,
        period: 0.005 - i * 0.0006,
        phase: i * 1.2,
        speed: 0.003 + i * 0.0015,
        alpha: 0.05 + i * 0.02,
        color: `rgba(6, ${120 + i * 20}, ${200 + i * 10},`,
      }));

      function draw() {
        if (!canvas || !ctx) return;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        waves.forEach((w) => {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 3) {
            const y =
              H * 0.6 +
              Math.sin(x * w.period + w.phase + t * w.speed * 60) * w.amp +
              Math.sin(x * w.period * 1.8 + t * w.speed * 45) * (w.amp * 0.35);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.lineTo(W, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fillStyle = `${w.color}${w.alpha})`;
          ctx.fill();
        });

        // Scan line effect
        const scanY = ((t * 35) % (H * 1.5)) - H * 0.25;
        const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
        scanGrad.addColorStop(0, "rgba(6, 182, 212, 0)");
        scanGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.07)");
        scanGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 60, W, 120);

        t += 0.016;
        animationFrameId = requestAnimationFrame(draw);
      }
      draw();

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationFrameId);
      };
    }

    const cleanupHero = setupWaveCanvas(heroCanvasRef.current);
    const cleanupCta = setupWaveCanvas(ctaCanvasRef.current);

    return () => {
      cleanupHero();
      cleanupCta();
    };
  }, []);

  // HUD radar coordinate jitter
  useEffect(() => {
    let lat = 17.42;
    let lon = 71.95;
    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.004;
      lon += (Math.random() - 0.5) * 0.005;
      setHudCoords(`${lat.toFixed(2)}° N · ${lon.toFixed(2)}° E`);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setModalOpen(false);
    onLaunchDashboard({ startPipelineImmediately: true });
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="jaldrishti-landing-root">
      {/* ========== NAVBAR ========== */}
      <nav className="navbar" id="navbar">
        <div className="nav-container">
          <a href="#hero" className="brand" onClick={() => scrollToSection("hero")}>
            <div className="brand-orb">
              <i className="fa-solid fa-water"></i>
            </div>
            <span>
              Jal<span className="brand-accent">Drishti</span>
            </span>
          </a>
          <ul className="nav-menu">
            <li>
              <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection("hero"); }}>
                Home
              </a>
            </li>
            <li>
              <a href="#what-we-do" onClick={(e) => { e.preventDefault(); scrollToSection("what-we-do"); }}>
                Overview
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection("how-it-works"); }}>
                How It Works
              </a>
            </li>
            <li>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>
                Solution
              </a>
            </li>
          </ul>
          <div className="nav-cta">
            <span className="live-badge">
              <span className="live-dot"></span>SAR LIVE FEED
            </span>
            <button
              className="btn-primary"
              onClick={() => onLaunchDashboard()}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <i className="fa-solid fa-satellite-dish"></i> Launch Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section
        className="hero"
        id="hero"
        style={{
          backgroundImage: `url('/final_image.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(5,15,35,0.92) 45%, rgba(5,15,35,0.65) 75%, rgba(5,15,35,0.3) 100%)",
            zIndex: 0,
          }}
        />

        {/* Ambient wave canvas */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity: 0.6 }}>
          <canvas ref={heroCanvasRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Hero Content */}
        <div className="container" style={{ position: "relative", zIndex: 10, paddingTop: "6rem", paddingBottom: "4rem" }}>
          <div className="hero-content" style={{ maxWidth: "760px" }}>
            <h1 className="hero-h1">
              Protecting Our Oceans<br />
              with <span className="gradient-word">Intelligent Technology</span>
            </h1>

            <h2 className="hero-h2" style={{ color: "rgba(255,255,255,0.9)", margin: "1.2rem 0" }}>
              AI-Powered Oil Spill Detection, Source Tracking &amp; Vessel Attribution
            </h2>

            <blockquote
              className="hero-quote"
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.7",
                color: "#94a3b8",
                borderLeft: "3px solid #06b6d4",
                paddingLeft: "1.2rem",
                marginBottom: "2.5rem",
              }}
            >
              Detect oil slicks instantly from SAR satellite passes, hindcast probable origin coordinates with
              hydrodynamic drift models, and attribute candidate vessels with explainable AIS telemetry.
            </blockquote>

            <div className="hero-buttons" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                className="btn-primary btn-hero"
                onClick={() => setModalOpen(true)}
                style={{ fontSize: "1rem", padding: "0.9rem 1.8rem" }}
              >
                <i className="fa-solid fa-satellite-dish"></i> Detect Oil Spill
              </button>
              <button
                className="btn-ghost btn-hero"
                onClick={() => onLaunchDashboard()}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  padding: "0.9rem 1.8rem",
                }}
              >
                <i className="fa-solid fa-map-location-dot"></i> Enter Investigation Dashboard
              </button>
            </div>

            {/* Quick Live HUD Telemetry */}
            <div
              style={{
                marginTop: "2.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "1.5rem",
                background: "rgba(10, 22, 46, 0.75)",
                backdropFilter: "blur(12px)",
                padding: "0.75rem 1.25rem",
                borderRadius: "14px",
                border: "1px solid rgba(6, 182, 212, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#38bdf8" }}>
                <i className="fa-solid fa-crosshairs animate-pulse"></i>
                <span className="font-mono">{hudCoords}</span>
              </div>
              <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.15)" }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#10b981" }}>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active SAR Surveillance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHAT WE DO ========== */}
      <section className="what-we-do" id="what-we-do" style={{ padding: "6rem 0", background: "#030c1a" }}>
        <div className="container">
          <div className="section-label">
            <i className="fa-solid fa-eye"></i> What We Do
          </div>
          <h2 className="section-h2" style={{ color: "#ffffff" }}>
            End-to-End Ocean Intelligence
          </h2>
          <p className="section-sub" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
            From raw radar satellite imagery to a ranked suspect list for investigation — our system automates the full
            investigation workflow.
          </p>
          <div className="what-grid">
            <div className="what-item">
              <div className="what-icon" style={{ ["--c" as any]: "#06b6d4" }}>
                <i className="fa-solid fa-satellite"></i>
              </div>
              <h3>Spaceborne Detection</h3>
              <p>SAR radar imagery processed to segment dark patches and confirm oil slicks with deep learning.</p>
            </div>
            <div className="what-item">
              <div className="what-icon" style={{ ["--c" as any]: "#38bdf8" }}>
                <i className="fa-solid fa-water"></i>
              </div>
              <h3>Slick Characterization</h3>
              <p>Geometry, area extent (km²), and classification differentiating mineral oil from natural look-alikes.</p>
            </div>
            <div className="what-item">
              <div className="what-icon" style={{ ["--c" as any]: "#818cf8" }}>
                <i className="fa-solid fa-wind"></i>
              </div>
              <h3>Origin Hindcasting</h3>
              <p>HYCOM ocean current &amp; wind models run backwards to pinpoint the probable release zone.</p>
            </div>
            <div className="what-item">
              <div className="what-icon" style={{ ["--c" as any]: "#34d399" }}>
                <i className="fa-solid fa-ship"></i>
              </div>
              <h3>Vessel Ranking</h3>
              <p>AIS trajectory cross-referencing to rank suspect vessels with transparent attribution evidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS — JOURNEY PATH ========== */}
      <section className="how-it-works" id="how-it-works" style={{ padding: "6rem 0", background: "#06132b" }}>
        <div className="container">
          <h2 className="section-h2" style={{ color: "#ffffff", textAlign: "center" }}>
            How It Works
          </h2>
          <p className="section-sub" style={{ color: "rgba(255, 255, 255, 0.8)", textAlign: "center", margin: "0 auto 3.5rem" }}>
            A streamlined 4-stage intelligent pipeline — from satellite pass to actionable vessel attribution.
          </p>

          {/* Step Flow Strip */}
          <div className="flow-strip" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "4rem", flexWrap: "wrap" }}>
            {[
              { num: 1, title: "Detect", sub: "SAR Satellite Pass", icon: "🛰️" },
              { num: 2, title: "Trace", sub: "Oil Slick Geometry", icon: "🌊" },
              { num: 3, title: "Hindcast", sub: "Probable Origin", icon: "⏪" },
              { num: 4, title: "Analyze", sub: "Candidate Vessels", icon: "🚢" },
            ].map((step) => (
              <div
                key={step.num}
                className={`flow-node ${activeStep === step.num ? "active" : ""}`}
                onClick={() => setActiveStep(step.num)}
                style={{ cursor: "pointer", transition: "all 0.3s" }}
              >
                <div className="flow-emoji">{step.icon}</div>
                <div className="flow-step-name">{step.title}</div>
                <div className="flow-step-sub">{step.sub}</div>
              </div>
            ))}
          </div>

          {/* Journey Path Cards */}
          <div className="journey">
            <div className="journey-item left">
              <div className="journey-media">
                <div className="journey-visual v1">
                  <div className="sar-grid"></div>
                  <div className="sar-slick"></div>
                  <div className="sar-label">SAR RADAR RETURN (SENTINEL-1)</div>
                </div>
              </div>
              <div className="journey-path">
                <div className="path-node"><span>01</span></div>
                <div className="path-line dashed"></div>
              </div>
              <div className="journey-content">
                <div className="step-tag">Step 01</div>
                <h3>Satellite Detection</h3>
                <p>
                  Detect potential oil spills from SAR (Synthetic Aperture Radar) satellite imagery. Unlike optical cameras,
                  SAR penetrates clouds, mist, and works 24/7 day and night.
                </p>
                <div className="step-chip"><i className="fa-solid fa-satellite"></i> Sentinel-1A / C-Band SAR</div>
              </div>
            </div>

            <div className="journey-item right">
              <div className="journey-content">
                <div className="step-tag">Step 02</div>
                <h3>Slick Analysis &amp; Validation</h3>
                <p>
                  Analyze the oil slick's surface characteristics, area (18.4 km²), perimeter, and confidence score.
                  Differentiate true crude spills from biogenic low-wind look-alikes.
                </p>
                <div className="step-chip"><i className="fa-solid fa-water"></i> 18.4 km² Verified Slick</div>
              </div>
              <div className="journey-path">
                <div className="path-node"><span>02</span></div>
                <div className="path-line dashed"></div>
              </div>
              <div className="journey-media">
                <div className="journey-visual v2">
                  <svg viewBox="0 0 240 160" className="slick-svg" style={{ width: "100%", height: "140px" }}>
                    <ellipse cx="120" cy="80" rx="85" ry="45" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 3" />
                    <ellipse cx="110" cy="75" rx="55" ry="28" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="1" />
                    <ellipse cx="115" cy="78" rx="30" ry="16" fill="rgba(239,68,68,0.45)" stroke="#f87171" strokeWidth="1" />
                    <text x="120" y="135" fill="#ef4444" fontSize="10" textAnchor="middle" fontFamily="monospace">CONFIRMED SLICK POLYGON</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="journey-item left">
              <div className="journey-media">
                <div className="journey-visual v3">
                  <svg viewBox="0 0 240 160" className="hindcast-svg" style={{ width: "100%", height: "140px" }}>
                    <defs>
                      <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                        <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
                      </marker>
                    </defs>
                    <line x1="30" y1="40" x2="70" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowBlue)" opacity="0.7" />
                    <line x1="60" y1="20" x2="90" y2="50" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowBlue)" opacity="0.7" />
                    <path d="M160,100 Q130,85 100,75 Q70,65 50,55" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeDasharray="8 4" />
                    <circle cx="160" cy="100" r="12" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="160" y="104" fill="#ef4444" fontSize="9" textAnchor="middle">SLICK</text>
                    <circle cx="50" cy="55" r="10" fill="rgba(6,182,212,0.4)" stroke="#06b6d4" strokeWidth="2" />
                    <text x="50" y="59" fill="#06b6d4" fontSize="8" textAnchor="middle">ORIGIN</text>
                    <text x="120" y="145" fill="#94a3b8" fontSize="9" textAnchor="middle">HYCOM Backward Hindcast Drift</text>
                  </svg>
                </div>
              </div>
              <div className="journey-path">
                <div className="path-node"><span>03</span></div>
                <div className="path-line dashed"></div>
              </div>
              <div className="journey-content">
                <div className="step-tag">Step 03</div>
                <h3>Origin Hindcasting &amp; Drift Forecast</h3>
                <p>
                  Reverse environmental modeling determines the estimated release time and coordinates where the oil
                  was discharged, while forward models project future drift plumes over 48 hours.
                </p>
                <div className="step-chip"><i className="fa-solid fa-wind"></i> Hydrodynamic Backward Hindcast</div>
              </div>
            </div>

            <div className="journey-item right">
              <div className="journey-content">
                <div className="step-tag">Step 04</div>
                <h3>AIS Telemetry &amp; Suspect Ranking</h3>
                <p>
                  Vessels intersecting the estimated origin box within the release window are ranked by proximity,
                  AIS transmission gaps, course changes, and historical anomaly scores.
                </p>
                <div className="step-chip"><i className="fa-solid fa-ship"></i> Explainable AI Ranking</div>
              </div>
              <div className="journey-path">
                <div className="path-node"><span>04</span></div>
              </div>
              <div className="journey-media">
                <div className="journey-visual v4" style={{ padding: "1rem", background: "rgba(5,15,35,0.85)" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.5rem" }}>
                    RANKED SUSPECT VESSELS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0.6rem", background: "rgba(239,68,68,0.15)", borderRadius: "6px", borderLeft: "3px solid #ef4444" }}>
                      <div><strong style={{ color: "#f87171" }}>#1 MT OCEAN NAVIGATOR</strong> <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>(Tanker)</span></div>
                      <div style={{ color: "#ef4444", fontWeight: 700 }}>92% Suspicion</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0.6rem", background: "rgba(245,158,11,0.1)", borderRadius: "6px", borderLeft: "3px solid #f59e0b" }}>
                      <div><strong style={{ color: "#fbbf24" }}>#2 MV PACIFIC GLORY</strong> <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>(Cargo)</span></div>
                      <div style={{ color: "#f59e0b", fontWeight: 700 }}>45% Suspicion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== KEY FEATURES ========== */}
      <section className="features" id="features" style={{ padding: "6rem 0", background: "#030c1a" }}>
        <div className="container">
          <h2 className="section-h2" style={{ color: "#ffffff", textAlign: "center" }}>
            Why Our Solution?
          </h2>
          <p className="section-sub" style={{ color: "rgba(255, 255, 255, 0.8)", textAlign: "center", margin: "0 auto 3.5rem" }}>
            Built for precision, rapid response, and scientific rigor in marine environmental protection.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-top">
                <div className="feature-icon" style={{ ["--fc" as any]: "#06b6d4" }}>🌍</div>
                <div className="feature-num">01</div>
              </div>
              <h3>24/7 Spaceborne Monitoring</h3>
              <p>Satellite radar surveillance covering thousands of square nautical miles regardless of cloud cover or night conditions.</p>
              <ul className="feature-list">
                <li><i className="fa-solid fa-check"></i> Sentinel-1A SAR integration</li>
                <li><i className="fa-solid fa-check"></i> Wide swath high-resolution processing</li>
                <li><i className="fa-solid fa-check"></i> Near real-time anomaly detection</li>
              </ul>
            </div>

            <div className="feature-card featured">
              <div className="feature-badge">Key Innovation</div>
              <div className="feature-top">
                <div className="feature-icon" style={{ ["--fc" as any]: "#818cf8" }}>🎯</div>
                <div className="feature-num">02</div>
              </div>
              <h3>Intelligent Source Tracking</h3>
              <p>Hydrodynamic current and wind vectors calculate the exact probabilistic discharge origin zone.</p>
              <ul className="feature-list">
                <li><i className="fa-solid fa-check"></i> HYCOM ocean current vectors</li>
                <li><i className="fa-solid fa-check"></i> 48-Hour forward drift simulation</li>
                <li><i className="fa-solid fa-check"></i> Spatial-temporal backward hindcasting</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-top">
                <div className="feature-icon" style={{ ["--fc" as any]: "#34d399" }}>🚢</div>
                <div className="feature-num">03</div>
              </div>
              <h3>Explainable Suspect Attribution</h3>
              <p>Multi-factor mathematical attribution combining trajectory proximity, transmission gaps, and speed anomalies.</p>
              <ul className="feature-list">
                <li><i className="fa-solid fa-check"></i> Live &amp; historical AIS tracking</li>
                <li><i className="fa-solid fa-check"></i> AIS "dark ship" gap detection</li>
                <li><i className="fa-solid fa-check"></i> Automated incident alerts &amp; PDF reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section className="cta-section" id="cta" style={{ position: "relative", padding: "6rem 0", background: "#06132b" }}>
        <div className="cta-ocean-bg" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }}>
          <canvas ref={ctaCanvasRef} style={{ width: "100%", height: "100%" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 5 }}>
          <div className="cta-card" style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(10, 22, 46, 0.8)", backdropFilter: "blur(20px)", borderRadius: "24px", border: "1px solid rgba(6,182,212,0.3)" }}>
            <div className="cta-tagline" style={{ display: "flex", justifyContent: "center", gap: "1rem", fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8", marginBottom: "1rem" }}>
              <span>Detect.</span> <span>Trace.</span> <span>Protect.</span>
            </div>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#ffffff", marginBottom: "1rem" }}>
              Ready to Launch Marine Investigation?
            </h2>
            <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto 2.5rem", fontSize: "1.1rem" }}>
              Access satellite radar footprints, hydrodynamic hindcasting, and vessel attribution in real time.
            </p>
            <div className="cta-buttons" style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <button
                className="btn-primary btn-lg"
                onClick={() => onLaunchDashboard({ startPipelineImmediately: true })}
                style={{ padding: "1rem 2.2rem", fontSize: "1.05rem" }}
              >
                <i className="fa-solid fa-satellite-dish"></i> Launch Investigation Dashboard
              </button>
              <button
                className="btn-ghost btn-lg"
                onClick={() => scrollToSection("hero")}
                style={{
                  color: "#ffffff",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  padding: "1rem 2.2rem",
                  fontSize: "1.05rem",
                }}
              >
                <i className="fa-solid fa-arrow-up"></i> Back to Top
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="site-footer" style={{ background: "#030814", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2.5rem 0" }}>
        <div className="container footer-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
          <div className="footer-brand" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
            <div className="brand-orb sm"><i className="fa-solid fa-water"></i></div>
            <span style={{ color: "#fff" }}>Jal<span className="brand-accent" style={{ color: "#06b6d4" }}>Drishti</span></span>
          </div>
          <p className="footer-text" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            © 2026 JalDrishti — Smart India Hackathon Marine Oil Spill Investigation System
          </p>
          <p className="footer-disclaimer" style={{ color: "#64748b", fontSize: "0.8rem", maxWidth: "700px" }}>
            This system identifies and ranks potential candidate vessels for further verification by coastal authorities and maritime environmental agencies.
          </p>
        </div>
      </footer>

      {/* ========== ANALYSIS LAUNCH MODAL ========== */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-icon">
              <i className="fa-solid fa-satellite-dish"></i>
            </div>
            <h3>Launch Oil Spill Investigation</h3>
            <p>Connect to the SAR satellite feed and initialize real-time anomaly attribution.</p>
            <form onSubmit={handleModalSubmit}>
              <div className="field">
                <label>Investigator / Officer Name</label>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  placeholder="e.g. Officer Sarah Jenkins"
                  required
                />
              </div>
              <div className="field">
                <label>Maritime Command / Agency</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="e.g. Indian Coast Guard"
                  required
                />
              </div>
              <div className="field">
                <label>Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@coastguard.gov.in"
                  required
                />
              </div>
              <button type="submit" className="btn-primary btn-full" style={{ marginTop: "1.5rem" }}>
                <i className="fa-solid fa-bolt"></i> Start Investigation in Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
