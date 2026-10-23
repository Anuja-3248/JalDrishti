/* JalDrishti 3D Three.js & GSAP Scroll Engine */

let scene, camera, renderer, globe, oilSlickMesh, vesselMarker, satelliteGroup, vesselPathLine;
let targetLookAt = new THREE.Vector3(0, 0, 0);

// Initialize Three.js 3D Scene
function init3D() {
  const container = document.getElementById('webgl-container');

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040814, 0.08);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 14);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x0d1f3c, 1.8);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
  sunLight.position.set(10, 20, 15);
  scene.add(sunLight);

  const redAlertLight = new THREE.PointLight(0xef4444, 3, 10);
  redAlertLight.position.set(0, 1.5, 2.5);
  scene.add(redAlertLight);

  // Create 3D Planet Earth & Ocean Mesh
  createGlobe();

  // Create Oil Spill Slick Polygon Mesh
  createOilSlick();

  // Create Suspicious 3D Vessel Marker & Trajectory
  createVesselAndTrack();

  // Create Orbiting Satellite with Laser Scan Cone
  createSatellite();

  // Create Dynamic Ocean Wave Particles
  createOceanParticles();

  // Window Resize Listener
  window.addEventListener('resize', onWindowResize);

  // Initialize GSAP ScrollTrigger Animations
  initScrollAnimations();

  // Render Loop
  animate();
}

// 1. Globe Mesh Construction
function createGlobe() {
  const globeRadius = 3.5;
  const geometry = new THREE.SphereGeometry(globeRadius, 64, 64);

  // Procedural Ocean Texture with Grids & Contour Lines
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep Navy Ocean Background
  ctx.fillStyle = '#06132b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Latitude & Longitude Wireframe Lines
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.lineWidth = 1;

  for (let i = 0; i < canvas.width; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j < canvas.height; j += 32) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(canvas.width, j);
    ctx.stroke();
  }

  // Draw Stylized Landmass Contours
  ctx.fillStyle = '#0f2942';
  ctx.beginPath();
  ctx.arc(300, 200, 90, 0, Math.PI * 2);
  ctx.arc(750, 180, 110, 0, Math.PI * 2);
  ctx.arc(500, 350, 80, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.2,
    bumpScale: 0.05
  });

  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Atmospheric Glow Outer Shell
  const atmosphereGeo = new THREE.SphereGeometry(globeRadius + 0.18, 64, 64);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  scene.add(atmosphere);
}

// 2. 3D Oil Spill Mesh Construction
function createOilSlick() {
  // Shape of the Oil Slick Polygon on the Globe Surface
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.4, 0.3, 0.8, 0.1);
  shape.quadraticCurveTo(1.2, -0.2, 0.9, -0.6);
  shape.quadraticCurveTo(0.3, -0.8, -0.2, -0.4);
  shape.quadraticCurveTo(-0.5, 0.1, 0, 0);

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide
  });

  oilSlickMesh = new THREE.Mesh(geometry, material);
  
  // Position on North Sea coordinates of Globe
  oilSlickMesh.position.set(0.8, 2.7, 2.1);
  oilSlickMesh.rotation.set(-0.5, 0.6, -0.3);
  oilSlickMesh.scale.set(0.7, 0.7, 0.7);
  scene.add(oilSlickMesh);
}

// 3. 3D Vessel Marker & Trajectory Path
function createVesselAndTrack() {
  // Vessel Trajectory Dotted Line
  const points = [];
  points.push(new THREE.Vector3(-1.5, 2.0, 2.8));
  points.push(new THREE.Vector3(-0.2, 2.4, 2.5));
  points.push(new THREE.Vector3(0.8, 2.7, 2.1));
  points.push(new THREE.Vector3(2.0, 2.5, 1.4));

  const curve = new THREE.CatmullRomCurve3(points);
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  
  const pathMaterial = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 0.1,
    gapSize: 0.05,
    linewidth: 2
  });

  vesselPathLine = new THREE.Line(pathGeometry, pathMaterial);
  vesselPathLine.computeLineDistances();
  scene.add(vesselPathLine);

  // Vessel Marker Geometry (Cone pointing direction)
  const vesselGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
  const vesselMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  vesselMarker = new THREE.Mesh(vesselGeo, vesselMat);
  
  vesselMarker.position.set(0.8, 2.7, 2.1);
  vesselMarker.rotation.set(0.8, -0.4, 0.5);
  scene.add(vesselMarker);
}

// 4. Orbiting SAR Satellite
function createSatellite() {
  satelliteGroup = new THREE.Group();

  // Satellite Body Box
  const bodyGeo = new THREE.BoxGeometry(0.2, 0.2, 0.3);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  satelliteGroup.add(body);

  // Solar Panels
  const panelGeo = new THREE.BoxGeometry(1.2, 0.02, 0.25);
  const panelMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  satelliteGroup.add(panel);

  // Radar Scan Laser Cone
  const coneGeo = new THREE.ConeGeometry(1.2, 3.2, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  const radarCone = new THREE.Mesh(coneGeo, coneMat);
  radarCone.position.set(0, -1.6, 0);
  radarCone.rotation.x = Math.PI;
  satelliteGroup.add(radarCone);

  satelliteGroup.position.set(2, 4.2, 3);
  scene.add(satelliteGroup);
}

// 5. Ocean Current Floating Particles
function createOceanParticles() {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 3.65 + Math.random() * 0.4;

    positions[i] = r * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = r * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x06b6d4,
    size: 0.04,
    transparent: true,
    opacity: 0.7
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

// Scroll-Bound GSAP Camera Animations
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Section 1 -> Section 2: Zoom camera towards the North Sea oil spill sector
  gsap.timeline({
    scrollTrigger: {
      trigger: "#sec-2",
      start: "top bottom",
      end: "top top",
      scrub: 1
    }
  })
  .to(camera.position, { x: 0.8, y: 3.2, z: 5.5 })
  .to(globe.rotation, { y: 0.8, x: -0.4 }, 0);

  // Section 2 -> Section 3: Focus on suspicious vessel & attribution score
  gsap.timeline({
    scrollTrigger: {
      trigger: "#sec-3",
      start: "top bottom",
      end: "top top",
      scrub: 1
    }
  })
  .to(camera.position, { x: 1.2, y: 2.8, z: 4.2 })
  .to(oilSlickMesh.scale, { x: 1.2, y: 1.2, z: 1.2 }, 0);

  // Section 3 -> Section 4: Zoom out slightly for evidence dossier
  gsap.timeline({
    scrollTrigger: {
      trigger: "#sec-4",
      start: "top bottom",
      end: "top top",
      scrub: 1
    }
  })
  .to(camera.position, { x: 0, y: 4.5, z: 8.5 })
  .to(globe.rotation, { y: 2.2 }, 0);

  // Toggle Visibility of Story Cards on Scroll
  document.querySelectorAll('.story-card').forEach(card => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 75%",
      onEnter: () => card.classList.add('visible'),
      onLeaveBack: () => card.classList.remove('visible')
    });
  });
}

// Set Radar Wavelength Spectrum
function setBand(band) {
  document.querySelectorAll('.band-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const hudBand = document.getElementById('hud-band');
  if (band === 'sar') {
    oilSlickMesh.material.color.setHex(0xef4444);
    hudBand.textContent = 'C-BAND (VV)';
  } else if (band === 'thermal') {
    oilSlickMesh.material.color.setHex(0xf59e0b);
    hudBand.textContent = 'THERMAL (IR)';
  } else if (band === 'optical') {
    oilSlickMesh.material.color.setHex(0x06b6d4);
    hudBand.textContent = 'OPTICAL (VIS)';
  }
}

// Window Resize Handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Slow continuous Globe & Satellite Orbit rotation
  if (globe) globe.rotation.y += 0.001;

  if (satelliteGroup) {
    const time = Date.now() * 0.001;
    satelliteGroup.position.x = Math.cos(time * 0.5) * 4.5;
    satelliteGroup.position.z = Math.sin(time * 0.5) * 4.5;
    satelliteGroup.lookAt(0, 0, 0);
  }

  // Pulse Oil Spill Opacity
  if (oilSlickMesh) {
    oilSlickMesh.material.opacity = 0.5 + Math.sin(Date.now() * 0.004) * 0.2;
  }

  renderer.render(scene, camera);
}

// Modal Handlers
function openDemoModal() {
  document.getElementById('demo-modal').classList.add('active');
}

function closeDemoModal() {
  document.getElementById('demo-modal').classList.remove('active');
}

function handleDemoSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('demo-name').value;
  alert(`Thank you ${name}. Your request for JalDrishti 3D Console Access has been registered.`);
  closeDemoModal();
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', init3D);
