/**
 * Signature hero scene: a dark planet with gold dotted continents, flowing light arcs
 * and three orbital rings with light trails. Plain three.js, custom shaders, no post-processing.
 *
 * Performance: DPR capped, render loop paused off-screen / in hidden tabs,
 * low tier halves the frame rate and particle counts. Everything is disposed on teardown.
 */
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineLoop,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';

export type Quality = 'high' | 'low';

export interface GlobeOptions {
  quality: Quality;
  landUrl: string;
  /** CSS breakpoint at which the hero switches to the wide (side-by-side) layout. */
  wideBreakpoint: number;
  onReady?: () => void;
  onError?: () => void;
}

export interface GlobeHandle {
  dispose: () => void;
}

const R = 2;
const CAM_Z = 12;
const FOV = 32;
const HOME = { lat: 17.69, lon: 83.22 }; // Visakhapatnam
const DESTINATIONS = [
  { lat: 51.5, lon: -0.13 },
  { lat: 37.77, lon: -122.42 },
  { lat: 35.68, lon: 139.69 },
  { lat: 1.35, lon: 103.82 },
  { lat: 25.2, lon: 55.27 },
  { lat: -33.87, lon: 151.21 },
  { lat: 52.52, lon: 13.4 },
  { lat: 12.97, lon: 77.59 },
];

const toVec = (lat: number, lon: number, r: number) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

/* ───────────────────────── Shaders ───────────────────────── */

const planetVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const planetFrag = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 L = normalize(vec3(-0.55, 0.6, 0.6));
    float diff = max(dot(vN, L), 0.0);
    float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
    vec3 col = vec3(0.016, 0.012, 0.009);
    col += vec3(0.36, 0.19, 0.05) * pow(diff, 2.2) * 0.32;
    col += vec3(1.0, 0.66, 0.22) * fres * 0.3;
    gl_FragColor = vec4(col, 1.0);
  }`;

const atmoVert = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const atmoFrag = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vN;
  void main() {
    float i = pow(clamp(0.7 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.2);
    gl_FragColor = vec4(uColor * i * 0.65, 1.0);
  }`;

const dotsVert = /* glsl */ `
  attribute float aRand;
  uniform float uSize;
  uniform float uTime;
  varying float vRand;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    vRand = aRand;
    gl_PointSize = uSize * (0.78 + aRand * 0.5) * (${CAM_Z.toFixed(1)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const dotsFrag = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying float vRand;
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.4 + vRand * 37.0);
    float limb = smoothstep(-0.02, 0.38, vFacing);
    vec3 col = mix(vec3(1.0, 0.6, 0.12), vec3(1.0, 0.9, 0.56), vRand);
    gl_FragColor = vec4(col, a * twinkle * limb * uOpacity);
  }`;

const trailVert = /* glsl */ `
  attribute float aT;
  uniform float uRadius;
  varying float vT;
  varying float vDepth;
  void main() {
    vT = aT;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec4 origin = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vDepth = (wp.z - origin.z) / max(uRadius, 0.0001);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const trailFrag = /* glsl */ `
  uniform float uHead;
  uniform float uBase;
  uniform float uTail;
  uniform float uLoop;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vT;
  varying float vDepth;
  void main() {
    float d = uHead - vT;
    if (uLoop > 0.5) d = fract(d);
    float trail = (d >= 0.0) ? exp(-d * uTail) : 0.0;
    float depth = mix(0.35, 1.0, smoothstep(-1.0, 0.6, vDepth));
    float a = (uBase + trail) * depth;
    gl_FragColor = vec4(mix(uColor, uHot, clamp(trail * 1.2, 0.0, 1.0)), a);
  }`;

const glowVert = /* glsl */ `
  uniform float uSize;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (${CAM_Z.toFixed(1)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const glowFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.12, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * (core * 1.4 + halo * halo * 0.9), (core + halo * halo * 0.7) * uOpacity);
  }`;

/* ───────────────────────── Scene ───────────────────────── */

export function createGlobeScene(container: HTMLElement, opts: GlobeOptions): GlobeHandle {
  const high = opts.quality === 'high';
  const renderer = new WebGLRenderer({ antialias: high, alpha: true, powerPreference: high ? 'high-performance' : 'low-power' });
  const pr = Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.4);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);

  const root = new Group();
  scene.add(root);
  const axis = new Group();
  axis.rotation.set(0.16, 0, 0.36);
  root.add(axis);
  const earth = new Group();
  // Start with India just left of centre; eastward rotation carries it into view.
  earth.rotation.y = -3.02 - 0.55;
  axis.add(earth);

  const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending } as const;

  // Planet body (also occludes far-side dots, arcs and ring segments)
  earth.add(new Mesh(new SphereGeometry(R * 0.995, high ? 72 : 48, high ? 54 : 36), new ShaderMaterial({ vertexShader: planetVert, fragmentShader: planetFrag })));

  // Atmosphere halo
  const atmo = new Mesh(
    new SphereGeometry(R * 1.17, 48, 32),
    new ShaderMaterial({ vertexShader: atmoVert, fragmentShader: atmoFrag, side: BackSide, uniforms: { uColor: { value: new Color('#c97a12') } }, ...additive }),
  );
  axis.add(atmo);

  // Graticule
  {
    const pts: number[] = [];
    const seg = 96;
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let i = 0; i < seg; i++) {
        const a = toVec(lat, (i / seg) * 360 - 180, R * 1.002);
        const b = toVec(lat, ((i + 1) / seg) * 360 - 180, R * 1.002);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    for (let lon = -180; lon < 180; lon += 30) {
      for (let i = 0; i < seg / 2; i++) {
        const a = toVec(-90 + (i / (seg / 2)) * 180, lon, R * 1.002);
        const b = toVec(-90 + ((i + 1) / (seg / 2)) * 180, lon, R * 1.002);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    const m = new ShaderMaterial({
      vertexShader: `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `void main(){ gl_FragColor = vec4(1.0, 0.7, 0.25, 0.07); }`,
      ...additive,
    });
    earth.add(new LineSegments(g, m));
  }

  // Dotted continents
  const dotsMat = new ShaderMaterial({
    vertexShader: dotsVert,
    fragmentShader: dotsFrag,
    uniforms: { uSize: { value: 2.4 * pr }, uTime: { value: 0 }, uOpacity: { value: 0 } },
    ...additive,
  });
  const dotsGeo = new BufferGeometry();
  const dots = new Points(dotsGeo, dotsMat);
  dots.frustumCulled = false;
  earth.add(dots);

  const setDots = (latlon: Float32Array) => {
    const n = latlon.length / 2;
    const pos = new Float32Array(n * 3);
    const rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const v = toVec(latlon[i * 2], latlon[i * 2 + 1], R * 1.004);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      rnd[i] = Math.random();
    }
    dotsGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
    dotsGeo.setAttribute('aRand', new Float32BufferAttribute(rnd, 1));
    dotsGeo.computeBoundingSphere();
  };

  // Procedural fallback if the land data cannot be fetched: a sparse Fibonacci sphere.
  const fibonacci = (count: number) => {
    const out = new Float32Array(count * 2);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      out[i * 2] = (Math.asin(y) * 180) / Math.PI;
      out[i * 2 + 1] = ((((i * golden) % (Math.PI * 2)) / Math.PI) * 180) - 180;
    }
    return out;
  };

  // Flowing arcs from home
  const arcs: ShaderMaterial[] = [];
  const homeVec = toVec(HOME.lat, HOME.lon, R);
  DESTINATIONS.forEach((dst, i) => {
    const a = homeVec.clone().normalize();
    const b = toVec(dst.lat, dst.lon, R).normalize();
    const angle = a.angleTo(b);
    const seg = 72;
    const pos: number[] = [];
    const ts: number[] = [];
    for (let s = 0; s <= seg; s++) {
      const t = s / seg;
      const sinA = Math.sin(angle) || 1;
      const p = a
        .clone()
        .multiplyScalar(Math.sin((1 - t) * angle) / sinA)
        .add(b.clone().multiplyScalar(Math.sin(t * angle) / sinA));
      const lift = 1 + Math.sin(Math.PI * t) * (0.06 + angle * 0.1);
      p.multiplyScalar(R * lift);
      pos.push(p.x, p.y, p.z);
      ts.push(t);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('aT', new Float32BufferAttribute(ts, 1));
    const m = new ShaderMaterial({
      vertexShader: trailVert,
      fragmentShader: trailFrag,
      uniforms: {
        uHead: { value: 0 },
        uBase: { value: 0.07 },
        uTail: { value: 7 },
        uLoop: { value: 0 },
        uRadius: { value: R },
        uColor: { value: new Color('#b8650a') },
        uHot: { value: new Color('#ffe08a') },
        uOffset: { value: i * 0.37 },
      },
      ...additive,
    });
    arcs.push(m);
    earth.add(new Line(g, m));
  });

  // Home beacon
  const beaconMat = new ShaderMaterial({
    vertexShader: glowVert,
    fragmentShader: glowFrag,
    uniforms: { uSize: { value: 26 * pr }, uColor: { value: new Color('#ffd27a') }, uOpacity: { value: 1 } },
    ...additive,
  });
  const beaconGeo = new BufferGeometry();
  const hv = toVec(HOME.lat, HOME.lon, R * 1.012);
  beaconGeo.setAttribute('position', new Float32BufferAttribute([hv.x, hv.y, hv.z], 3));
  earth.add(new Points(beaconGeo, beaconMat));

  // Orbital rings with travelling light
  const ringDefs = [
    { r: 1.4, rx: 0.34, rz: 0.42, speed: 0.07, base: 0.11, color: '#c47a12' },
    { r: 1.68, rx: 0.26, rz: -0.36, speed: -0.048, base: 0.08, color: '#9a5a0c' },
    { r: 2.02, rx: 0.42, rz: 0.12, speed: 0.033, base: 0.055, color: '#7a4100' },
  ];
  const rings = ringDefs.map((def, i) => {
    const group = new Group();
    group.rotation.set(def.rx, 0, def.rz);
    root.add(group);
    const seg = 320;
    const pos: number[] = [];
    const ts: number[] = [];
    for (let s = 0; s < seg; s++) {
      const a = (s / seg) * Math.PI * 2;
      pos.push(Math.cos(a) * R * def.r, 0, Math.sin(a) * R * def.r);
      ts.push(s / seg);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('aT', new Float32BufferAttribute(ts, 1));
    const m = new ShaderMaterial({
      vertexShader: trailVert,
      fragmentShader: trailFrag,
      uniforms: {
        uHead: { value: i * 0.31 },
        uBase: { value: def.base },
        uTail: { value: 5.5 },
        uLoop: { value: 1 },
        uRadius: { value: R * def.r },
        uColor: { value: new Color(def.color) },
        uHot: { value: new Color('#ffe7a0') },
      },
      ...additive,
    });
    group.add(new LineLoop(g, m));
    const satGeo = new BufferGeometry();
    satGeo.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    const satMat = new ShaderMaterial({
      vertexShader: glowVert,
      fragmentShader: glowFrag,
      uniforms: { uSize: { value: (i === 0 ? 30 : 22) * pr }, uColor: { value: new Color('#ffd98a') }, uOpacity: { value: 0.95 } },
      ...additive,
    });
    const sat = new Points(satGeo, satMat);
    group.add(sat);
    return { def, m, sat, radius: R * def.r };
  });

  // Ambient dust for depth
  const dustCount = high ? 520 : 220;
  {
    const pos = new Float32Array(dustCount * 3);
    const rnd = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const v = new Vector3().randomDirection().multiplyScalar(R * (1.5 + Math.random() * 2.6));
      pos.set([v.x * 1.4, v.y, v.z], i * 3);
      rnd[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('aRand', new Float32BufferAttribute(rnd, 1));
    const m = new ShaderMaterial({
      vertexShader: `
        attribute float aRand; uniform float uSize; varying float vR;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vR=aRand; gl_PointSize = uSize*(0.4+aRand)*(${CAM_Z.toFixed(1)}/-mv.z); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `
        uniform float uTime; varying float vR;
        void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; float a=smoothstep(0.5,0.0,d)*(0.25+0.35*sin(uTime*0.8+vR*50.0)*0.5+0.175);
          gl_FragColor=vec4(mix(vec3(1.0,0.55,0.1),vec3(1.0,0.85,0.5),vR), a*0.6); }`,
      uniforms: { uSize: { value: 2.6 * pr }, uTime: { value: 0 } },
      ...additive,
    });
    const dust = new Points(g, m);
    dust.name = 'dust';
    root.add(dust);
  }

  /* ───────────── Layout: place the globe to match the CSS composition ───────────── */
  let width = 0;
  let height = 0;
  let baseY = 0;
  const layout = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const halfH = Math.tan((FOV * Math.PI) / 360) * CAM_Z;
    const halfW = halfH * camera.aspect;
    const wide = window.innerWidth >= opts.wideBreakpoint;
    const fx = wide ? 0.735 : 0.5;
    const fy = wide ? 0.36 : 0.36;
    const diameterPx = wide ? Math.min(height * 0.54, width * 0.37) : Math.min(width * 0.9, height * 0.6);
    const worldPerPx = (2 * halfH) / height;
    baseY = (1 - fy * 2) * halfH;
    root.position.set((fx * 2 - 1) * halfW, baseY, 0);
    const scale = (diameterPx * worldPerPx) / (2 * R);
    root.scale.setScalar(scale);
    arcs.forEach((m) => (m.uniforms.uRadius.value = R * scale));
    rings.forEach(({ m, radius }) => (m.uniforms.uRadius.value = radius * scale));
    const pxScale = diameterPx / 560;
    dotsMat.uniforms.uSize.value = 2.8 * pr * Math.max(0.8, pxScale);
  };
  const ro = new ResizeObserver(layout);
  ro.observe(container);
  layout();

  /* ───────────── Interaction ───────────────────────── */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const fine = window.matchMedia('(pointer: fine)').matches;
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (fine) window.addEventListener('pointermove', onPointer, { passive: true });

  /* ───────────── Loop ───────────────────────── */
  let raf = 0;
  let running = false;
  let visible = true;
  let last = 0;
  let time = 0;
  let frameToggle = false;
  let readyFired = false;
  let dotsFade = 0;
  let dotsLoaded = false;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!high) {
      frameToggle = !frameToggle;
      if (frameToggle) return;
    }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    camera.position.x = pointer.x * 0.45;
    camera.position.y = -pointer.y * 0.3;

    const scrollP = Math.min(1, window.scrollY / Math.max(1, height));
    root.position.y = baseY + scrollP * 1.6;
    root.rotation.y = pointer.x * 0.16;
    root.rotation.x = pointer.y * 0.08 + scrollP * 0.25;

    earth.rotation.y += dt * 0.045;

    if (dotsLoaded && dotsFade < 1) dotsFade = Math.min(1, dotsFade + dt * 0.9);
    dotsMat.uniforms.uOpacity.value = dotsFade;
    dotsMat.uniforms.uTime.value = time;

    arcs.forEach((m, i) => {
      const cycle = 3.2 + (i % 3) * 0.7;
      m.uniforms.uHead.value = ((time + m.uniforms.uOffset.value * cycle) % cycle) / cycle * 1.6 - 0.1;
    });
    beaconMat.uniforms.uOpacity.value = 0.75 + Math.sin(time * 2.4) * 0.25;

    rings.forEach(({ def, m, sat, radius }) => {
      const head = (((m.uniforms.uHead.value as number) + dt * def.speed) % 1 + 1) % 1;
      m.uniforms.uHead.value = head;
      const a = head * Math.PI * 2;
      sat.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    });
    const dust = root.getObjectByName('dust') as Points | undefined;
    if (dust) {
      dust.rotation.y += dt * 0.01;
      (dust.material as ShaderMaterial).uniforms.uTime.value = time;
    }

    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      opts.onReady?.();
    }
  };

  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(container);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
    opts.onError?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  // Load land data (lazy, small); fall back to a procedural sphere.
  const controller = new AbortController();
  fetch(opts.landUrl, { signal: controller.signal })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.arrayBuffer();
    })
    .then((buf) => {
      const q = new Int16Array(buf);
      const out = new Float32Array(q.length);
      for (let i = 0; i < q.length; i++) out[i] = q[i] / 180;
      setDots(out);
    })
    .catch((err: unknown) => {
      if ((err as Error).name === 'AbortError') return;
      setDots(fibonacci(4200));
    })
    .finally(() => {
      dotsLoaded = true;
    });

  start();

  return {
    dispose() {
      stop();
      controller.abort();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      scene.traverse((obj: Object3D) => {
        const o = obj as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
        o.geometry?.dispose();
        if (Array.isArray(o.material)) o.material.forEach((mm) => mm.dispose());
        else o.material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
