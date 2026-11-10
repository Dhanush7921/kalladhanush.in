/**
 * DEVA emblem — an original, procedurally built steel "D" with twin blades.
 * Loaded only when the DEVA section approaches the viewport, on capable devices.
 * Renders only while visible; everything is disposed on teardown.
 */
import * as THREE from 'three';

export interface DevaEmblemOptions {
  quality: 'high' | 'low';
  onReady?: () => void;
  onError?: () => void;
}
export interface DevaEmblemHandle {
  setPointer: (x: number, y: number) => void;
  setHover: (on: boolean) => void;
  setVisible: (on: boolean) => void;
  impact: () => void;
  dispose: () => void;
}

/** Brushed, scratched steel: one small canvas drives both roughness and bump. */
function steelTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#8a8a8a';
  g.fillRect(0, 0, size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 2600; i++) {
    const v = 90 + Math.floor(rnd() * 110);
    g.fillStyle = `rgba(${v},${v},${v},${0.1 + rnd() * 0.22})`;
    g.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 2, 1);
  }
  for (let i = 0; i < 150; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const len = 12 + rnd() * 80;
    const a = -0.5 + rnd() * 0.35;
    const light = rnd() > 0.45;
    g.strokeStyle = light ? `rgba(232,232,232,${0.1 + rnd() * 0.3})` : `rgba(26,26,26,${0.12 + rnd() * 0.3})`;
    g.lineWidth = 0.5 + rnd() * 1.1;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 4 + rnd() * 12;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(34,34,34,0.5)');
    grad.addColorStop(1, 'rgba(34,34,34,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.42, 0.42);
  tex.anisotropy = 4;
  return tex;
}

function haloTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,140,60,0.95)');
  grad.addColorStop(0.28, 'rgba(255,72,24,0.5)');
  grad.addColorStop(0.6, 'rgba(170,16,26,0.2)');
  grad.addColorStop(1, 'rgba(120,0,10,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A tiny studio of glowing panels, pre-filtered into reflections for the metal. */
function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050404);
  const geo = new THREE.PlaneGeometry(1, 1);
  const mats: THREE.Material[] = [];
  const panel = (hex: number, gain: number, w: number, h: number, pos: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(gain), side: THREE.DoubleSide });
    mats.push(mat);
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(w, h, 1);
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(0xe6ecf5, 5, 9, 1.6, [0, 7, 3]); // cold overhead strip
  panel(0xff6a1a, 6, 5, 5, [-7, -2.5, 2]); // furnace orange, low left
  panel(0xc1121f, 5, 4, 7, [7.5, 0.5, 1]); // crimson wall, right
  panel(0xffffff, 8, 1.2, 1.2, [2.5, 3, 7]); // key highlight
  panel(0xff3b14, 3, 10, 2, [0, -7, -2]); // ember floor
  panel(0x3a4250, 2, 8, 8, [0, 0, -9]); // dim steel backdrop
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.035);
  pmrem.dispose();
  geo.dispose();
  mats.forEach((m) => m.dispose());
  return target.texture;
}

function buildEmblem(curveSegments: number): THREE.BufferGeometry[] {
  const d = new THREE.Shape();
  d.moveTo(-1.15, 1.5);
  d.lineTo(0.25, 1.5);
  d.bezierCurveTo(1.25, 1.5, 1.75, 0.75, 1.75, 0);
  d.bezierCurveTo(1.75, -0.75, 1.25, -1.5, 0.25, -1.5);
  d.lineTo(-0.72, -1.5);
  d.lineTo(-1.15, -1.02);
  d.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.45, 0.85);
  hole.lineTo(0.2, 0.85);
  hole.bezierCurveTo(0.75, 0.85, 1.0, 0.45, 1.0, 0);
  hole.bezierCurveTo(1.0, -0.45, 0.75, -0.85, 0.2, -0.85);
  hole.lineTo(-0.45, -0.85);
  hole.closePath();
  d.holes.push(hole);

  const blade = (pts: [number, number][]) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return s;
  };
  const upper = blade([[-1.08, 1.5], [-2.85, 1.72], [-1.08, 0.98]]);
  const lower = blade([[1.5, 0.42], [3.05, 0.66], [1.58, -0.3]]);

  const body = new THREE.ExtrudeGeometry(d, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.075, bevelSegments: 3, curveSegments });
  body.translate(0, 0, -0.25);
  const blades = new THREE.ExtrudeGeometry([upper, lower], { depth: 0.24, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 2, curveSegments: 2 });
  blades.translate(0, 0, -0.12);

  // Forward lean, like the poster's italic cut.
  const shear = new THREE.Matrix4().set(1, 0.2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  body.applyMatrix4(shear);
  blades.applyMatrix4(shear);
  body.computeVertexNormals();
  blades.computeVertexNormals();
  return [body, blades];
}

export function createDevaEmblem(container: HTMLElement, opts: DevaEmblemOptions): DevaEmblemHandle {
  const high = opts.quality === 'high';
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    opts.onError?.();
    return { setPointer: () => undefined, setHover: () => undefined, setVisible: () => undefined, impact: () => undefined, dispose: () => undefined };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.25));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  const envMap = buildEnvironment(renderer);
  const steel = steelTexture();
  const metal = new THREE.MeshStandardMaterial({
    color: 0xc4c7cc,
    metalness: 1,
    roughness: 0.52,
    roughnessMap: steel,
    bumpMap: steel,
    bumpScale: 0.6,
    envMap,
    envMapIntensity: 1.25,
  });
  const edge = new THREE.MeshStandardMaterial({ color: 0xe9ebee, metalness: 1, roughness: 0.2, envMap, envMapIntensity: 1.5 });

  const [bodyGeo, bladeGeo] = buildEmblem(high ? 28 : 14);
  const emblem = new THREE.Group();
  emblem.add(new THREE.Mesh(bodyGeo, metal), new THREE.Mesh(bladeGeo, edge));
  emblem.position.x = -0.1;
  const rig = new THREE.Group();
  rig.scale.setScalar(0.66);
  rig.add(emblem);
  scene.add(rig);

  // Eclipse ring + halo behind the emblem.
  const ringGeo = new THREE.TorusGeometry(2.05, 0.028, 8, high ? 120 : 72, Math.PI * 1.55);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a1e).multiplyScalar(2.2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.z = Math.PI * 0.18;
  ring.position.z = -0.6;
  rig.add(ring);

  const halo = haloTexture();
  const haloMat = new THREE.SpriteMaterial({ map: halo, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const haloSprite = new THREE.Sprite(haloMat);
  haloSprite.scale.setScalar(7.4);
  haloSprite.position.z = -1.2;
  rig.add(haloSprite);

  const shockGeo = new THREE.RingGeometry(0.96, 1, 64);
  const shockMat = new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const shock = new THREE.Mesh(shockGeo, shockMat);
  shock.position.z = 0.4;
  scene.add(shock);

  // Lights: a furnace light that follows the cursor, a crimson rim, a cold fill.
  const cursorLight = new THREE.PointLight(0xff7a2a, 26, 14, 2);
  cursorLight.position.set(1.5, 1, 3.2);
  const rim = new THREE.PointLight(0xc1121f, 40, 14, 2);
  rim.position.set(-3.2, 1.6, -1.8);
  const fill = new THREE.DirectionalLight(0xcfd8e6, 0.5);
  fill.position.set(0.4, 3, 4);
  scene.add(cursorLight, rim, fill, new THREE.AmbientLight(0x221a18, 0.6));

  // Sparks
  const count = high ? 220 : 90;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const spawn = (i: number, anywhere: boolean) => {
    const a = Math.random() * Math.PI * 2;
    const r = 0.6 + Math.random() * 1.5;
    pos[i * 3] = Math.cos(a) * r * 1.3;
    pos[i * 3 + 1] = anywhere ? -2 + Math.random() * 4.4 : -1.9 - Math.random() * 0.5;
    pos[i * 3 + 2] = -0.8 + Math.random() * 1.8;
    vel[i * 3] = (Math.random() - 0.5) * 0.22;
    vel[i * 3 + 1] = 0.25 + Math.random() * 0.6;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
  };
  for (let i = 0; i < count; i++) spawn(i, true);
  const sparkGeo = new THREE.BufferGeometry();
  const sparkAttr = new THREE.BufferAttribute(pos, 3);
  sparkAttr.setUsage(THREE.DynamicDrawUsage);
  sparkGeo.setAttribute('position', sparkAttr);
  const sparkMat = new THREE.PointsMaterial({ color: new THREE.Color(0xff8a3c).multiplyScalar(1.8), size: 0.045, sizeAttenuation: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  scene.add(sparks);

  // State
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let hover = 0;
  let hoverTarget = 0;
  let impactAt = -1;
  let visible = false;
  let disposed = false;
  let frame = 0;
  let last = 0;
  let ready = false;
  const start = performance.now();

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the full emblem (blades included) inside narrow frames.
    camera.position.z = camera.aspect < 1 ? 9 / Math.max(0.6, camera.aspect) : 9;
    camera.updateProjectionMatrix();
  };
  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  ro?.observe(container);
  resize();

  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const t = (now - start) / 1000;

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 5);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 5);
    hover += (hoverTarget - hover) * Math.min(1, dt * 7);

    // Impact: brief recoil, then a controlled punch toward the camera with a shock ring.
    let punch = 0;
    let flash = 0;
    if (impactAt >= 0) {
      const k = (now - impactAt) / 1000;
      if (k < 0.09) punch = -0.1 * (k / 0.09);
      else if (k < 0.3) {
        const e = (k - 0.09) / 0.21;
        punch = -0.1 + 0.34 * (1 - (1 - e) * (1 - e));
      } else punch = 0.24;
      const s = Math.max(0, k - 0.09);
      flash = Math.max(0, 1 - s / 0.5);
      shock.scale.setScalar(1.4 + s * 9);
      shockMat.opacity = k < 0.09 ? 0 : flash * 0.85;
    }

    emblem.rotation.y = Math.sin(t * 0.55) * 0.3 + pointer.x * 0.42;
    emblem.rotation.x = Math.sin(t * 0.4) * 0.05 - pointer.y * 0.24;
    emblem.position.y = Math.sin(t * 0.9) * 0.06;
    emblem.position.z = hover * 0.55 + punch * 3;
    emblem.scale.setScalar(1 + hover * 0.07 + punch);
    ring.rotation.z = Math.PI * 0.18 + t * 0.22;
    ringMat.opacity = 0.62 + hover * 0.3 + Math.sin(t * 2.2) * 0.08 + flash * 0.3;
    haloMat.opacity = 0.42 + hover * 0.22 + Math.sin(t * 1.3) * 0.05 + flash * 0.5;
    haloSprite.scale.setScalar(7.4 + hover * 0.8 + flash * 3);

    cursorLight.position.set(pointer.x * 4.2, pointer.y * 3 + 0.4, 3 + hover * 0.6);
    cursorLight.intensity = 22 + hover * 22 + flash * 90;
    rim.intensity = 36 + Math.sin(t * 1.7) * 6 + flash * 40;

    const lift = 1 + hover * 0.8;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      pos[j] += vel[j] * dt * lift + Math.sin(t * 1.3 + i) * 0.0016;
      pos[j + 1] += vel[j + 1] * dt * lift;
      pos[j + 2] += vel[j + 2] * dt * lift;
      if (pos[j + 1] > 2.7 || Math.abs(pos[j]) > 4.4) spawn(i, false);
    }
    sparkAttr.needsUpdate = true;

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady?.();
    }
    frame = requestAnimationFrame(tick);
  };
  const run = () => {
    if (!frame && visible && !disposed && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else run();
  };
  document.addEventListener('visibilitychange', onVisibility);
  const onLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    opts.onError?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  return {
    setPointer(x, y) {
      pointer.tx = Math.max(-1, Math.min(1, x));
      pointer.ty = Math.max(-1, Math.min(1, y));
    },
    setHover(on) {
      hoverTarget = on ? 1 : 0;
    },
    setVisible(on) {
      visible = on;
      if (on) run();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    impact() {
      impactAt = performance.now();
      for (let i = 0; i < count; i++) {
        const j = i * 3;
        const len = Math.hypot(pos[j], pos[j + 1]) || 1;
        const p = 1.5 + Math.random() * 3.5;
        vel[j] += (pos[j] / len) * p;
        vel[j + 1] += (pos[j + 1] / len) * p;
      }
      run();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      ro?.disconnect();
      [bodyGeo, bladeGeo, ringGeo, shockGeo, sparkGeo].forEach((g) => g.dispose());
      [metal, edge, ringMat, haloMat, shockMat, sparkMat].forEach((m) => m.dispose());
      steel.dispose();
      halo.dispose();
      envMap.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
