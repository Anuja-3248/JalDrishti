/* =============================================
   JalDrishti — App Logic
   ============================================= */

/* ---- Navbar scroll effect (safe, runs after DOM ready) ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const si = document.querySelector('.scroll-indicator');
    if (si) si.style.opacity = window.scrollY > 80 ? '0' : '1';
  });
}

/* ---- Smooth Scroll ---- */
function smoothScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ---- Modal ---- */
function openModal() {
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('modal-name')?.value || 'Analyst';
  closeModal();
  // Success notification
  const toast = document.createElement('div');
  toast.textContent = `✅ Analysis session initiated for ${name}. Loading investigation dashboard...`;
  toast.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
    background:#0a162e; border:1px solid rgba(6,182,212,0.5); color:#f8fafc;
    padding:1rem 1.75rem; border-radius:12px; z-index:9999; font-size:0.95rem;
    box-shadow:0 10px 40px rgba(0,0,0,0.6); font-family:'Plus Jakarta Sans',sans-serif;
    transition:opacity 0.5s; white-space:nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => { 
    toast.style.opacity = '0'; 
    setTimeout(() => {
      toast.remove();
      window.location.href = 'http://localhost:5173/#dashboard';
    }, 400); 
  }, 1200);
}

/* ---- Ocean Canvas Animation (Hero) ---- */
function initOceanCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const waves = Array.from({ length: 5 }, (_, i) => ({
    amp:    40 + i * 15,
    period: 0.006 - i * 0.0008,
    phase:  i * 1.2,
    speed:  0.004 + i * 0.002,
    alpha:  0.04 + i * 0.015,
    color:  `rgba(6,${100 + i * 18},${180 + i * 15},`,
  }));

  let t = 0;

  function draw() {
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);

    waves.forEach(w => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H * 0.55 + Math.sin(x * w.period + w.phase + t * w.speed * 60) * w.amp
                             + Math.sin(x * w.period * 1.7 + t * w.speed * 45) * (w.amp * 0.4);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = `${w.color}${w.alpha})`;
      ctx.fill();
    });

    // Scan line effect
    const scanY = ((t * 30) % (H * 1.5)) - H * 0.25;
    const scanGrad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
    scanGrad.addColorStop(0,   'rgba(6,182,212,0)');
    scanGrad.addColorStop(0.5, 'rgba(6,182,212,0.06)');
    scanGrad.addColorStop(1,   'rgba(6,182,212,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 80, W, 160);

    t += 0.016;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---- Floating Particles (Hero) ---- */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left     = Math.random() * 100 + 'vw';
    p.style.top      = Math.random() * 100 + 'vh';
    p.style.width    = (1.5 + Math.random() * 2.5) + 'px';
    p.style.height   = p.style.width;
    p.style.animationDelay    = (Math.random() * 12) + 's';
    p.style.animationDuration = (8 + Math.random() * 16) + 's';
    container.appendChild(p);
  }
}

/* ---- Flow Node Interaction ---- */
function initFlowNodes() {
  document.querySelectorAll('.flow-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      document.querySelectorAll('.flow-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');
    });
  });
}

/* ---- Intersection Observer for journey items ---- */
function initScrollReveal() {
  const items = document.querySelectorAll('.journey-item, .what-item, .feature-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    obs.observe(el);
  });
}

/* ---- Satellite radar ping animation on HUD card ---- */
function initHUDAnimation() {
  const score = document.getElementById ? null : null;
  const coords = document.querySelector('.hud-coords');
  if (!coords) return;
  // Animate coordinates slightly
  let lat = 53.21, lon = 4.10;
  setInterval(() => {
    lat += (Math.random() - 0.5) * 0.002;
    lon += (Math.random() - 0.5) * 0.003;
    coords.textContent = `${lat.toFixed(2)}° N · ${lon.toFixed(2)}° E`;
  }, 2000);
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initOceanCanvas('ocean-canvas');
  initOceanCanvas('cta-canvas');
  initParticles();
  initFlowNodes();
  initScrollReveal();
  initHUDAnimation();
});
