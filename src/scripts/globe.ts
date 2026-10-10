/**
 * The 3D stage: a real-time WebGL Earth with golden illumination, dotted
 * continents, city lights, orbital paths, a starfield and (on the intro) an
 * extruded metallic "D." monogram that frames the planet.
 *
 * Map data: Natural Earth (public domain), pre-baked by scripts/generate-earth.py.
 */
import {
  AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, DirectionalLight,
  EllipseCurve, ExtrudeGeometry, Group, LineBasicMaterial, LineLoop, MathUtils, Mesh,
  MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator, Points, RingGeometry, Scene, Shape,
  ShaderMaterial, SphereGeometry, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
  ACESFilmicToneMapping, DoubleSide,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { url } from '../lib/url';

export type StageMode = 'intro' | 'hero' | 'contact';

export interface StageOptions {
  canvas: HTMLCanvasElement;
  /** Element whose size the canvas follows. */
  host: HTMLElement;
  /** Elements that start a drag of the globe. */
  interactionTargets?: HTMLElement[];
  mode: StageMode;
  monogram?: boolean;
  home: { lat: number; lon: number };
  onProgress?: (fraction: number) => void;
}

interface Layout {
  gx: number; gy: number; gz: number; gs: number; // globe position + radius
  dx: number; dy: number; dz: number; ds: number; dRot: number; dOpacity: number; // monogram
  ringScale: number; ringTilt: number;
  light: Vector3;
  spin: number; // auto-rotation rad/s
  rim: number; rimPow: number; // fresnel rim strength / tightness
}

const DEG = Math.PI / 180;
/** Colours for raw (non colour-managed) shaders, kept in display space. */
const hexVec = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function latLonToVec3(lat: number, lon: number, r: number, out = new Vector3()) {
  const phi = (lon + 180) * DEG;
  const theta = (90 - lat) * DEG;
  return out.set(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}

async function fetchFloats(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return new Float32Array(await res.arrayBuffer());
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/* ------------------------------ Shaders ------------------------------ */

const earthVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

const earthFrag = /* glsl */ `
  uniform sampler2D uData; uniform vec3 uLight; uniform float uPulse; uniform float uRim; uniform float uRimPow;
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main() {
    vec3 d = texture2D(uData, vUv).rgb;
    float land = d.r, coast = d.g, city = d.b;
    vec3 N = normalize(vN); vec3 V = normalize(vView);
    float ndl = dot(N, uLight);
    float day = smoothstep(-0.25, 0.6, ndl);
    vec3 ocean = vec3(0.010, 0.009, 0.008) + vec3(0.045, 0.030, 0.016) * day;
    vec3 landCol = mix(vec3(0.030, 0.022, 0.014), vec3(0.30, 0.205, 0.10), day);
    vec3 col = mix(ocean, landCol, land);
    col += vec3(0.95, 0.70, 0.36) * coast * (0.10 + 0.45 * day);
    vec3 H = normalize(uLight + V);
    col += vec3(1.0, 0.80, 0.48) * pow(max(dot(N, H), 0.0), 70.0) * (1.0 - land) * 0.55 * day;
    float night = 1.0 - smoothstep(-0.1, 0.3, ndl);
    col += vec3(1.0, 0.62, 0.24) * city * night * 1.5;
    float fr = pow(1.0 - max(dot(N, V), 0.0), uRimPow);
    col += vec3(0.95, 0.68, 0.32) * fr * (0.2 + 0.8 * smoothstep(-0.5, 0.6, ndl)) * (0.85 + uPulse) * uRim;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

const atmoVert = /* glsl */ `
  varying vec3 vNV; varying vec3 vNW;
  void main() {
    vNV = normalize(normalMatrix * normal);
    vNW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const atmoFrag = /* glsl */ `
  uniform vec3 uLight; uniform float uPulse; uniform float uRim;
  varying vec3 vNV; varying vec3 vNW;
  void main() {
    float i = pow(max(0.0, 0.72 - dot(vNV, vec3(0.0, 0.0, 1.0))), 3.2) * uRim;
    float lit = 0.3 + 0.7 * smoothstep(-0.6, 0.5, dot(vNW, uLight));
    vec3 col = mix(vec3(0.85, 0.48, 0.18), vec3(1.0, 0.84, 0.52), lit);
    gl_FragColor = vec4(col * i * (1.6 + uPulse * 2.0) * lit, 1.0);
  }`;

const pointsVert = /* glsl */ `
  attribute float aSize; attribute float aPhase;
  uniform float uScale; uniform float uGlobe; uniform float uTime; uniform vec3 uLight; uniform float uNightOnly;
  varying float vAlpha;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * position);
    float ndl = dot(n, uLight);
    float day = smoothstep(-0.3, 0.5, ndl);
    float tw = 0.75 + 0.25 * sin(uTime * 1.7 + aPhase * 6.2831);
    vAlpha = mix(0.22 + 0.78 * day, (1.0 - smoothstep(-0.1, 0.3, ndl)) * tw, uNightOnly);
    vec4 mv = viewMatrix * wp;
    gl_PointSize = aSize * uScale * uGlobe / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;

const pointsFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.15, d) * vAlpha * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }`;

const starsVert = /* glsl */ `
  attribute float aSize; attribute float aPhase; uniform float uTime; uniform float uScale;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vA = 0.45 + 0.55 * sin(uTime * 0.9 + aPhase * 6.2831);
    gl_PointSize = aSize * uScale;
    gl_Position = projectionMatrix * mv;
  }`;

const starsFrag = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vA * 0.85;
    gl_FragColor = vec4(vec3(1.0, 0.93, 0.80) * a, a);
  }`;

/* ------------------------------ Monogram ------------------------------ */

function monogramShape() {
  // A Didone "D": heavy stem and bowl, hairline joins and serifs.
  const s = new Shape();
  s.moveTo(-0.24, 1.0);
  s.lineTo(0.62, 1.0);
  s.absellipse(0.62, 0, 0.98, 1.0, Math.PI / 2, -Math.PI / 2, true, 0);
  s.lineTo(-0.24, -1.0);
  s.lineTo(-0.24, -0.952);
  s.quadraticCurveTo(-0.01, -0.952, 0.0, -0.86);
  s.lineTo(0.0, 0.86);
  s.quadraticCurveTo(-0.01, 0.952, -0.24, 0.952);
  s.lineTo(-0.24, 1.0);
  const hole = new Shape();
  hole.moveTo(0.32, 0.952);
  hole.lineTo(0.62, 0.952);
  hole.absellipse(0.62, 0, 0.6, 0.952, Math.PI / 2, -Math.PI / 2, true, 0);
  hole.lineTo(0.32, -0.952);
  hole.lineTo(0.32, 0.952);
  s.holes.push(hole);
  return s;
}

/* ------------------------------ Stage ------------------------------ */

export class GlobeStage {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(35, 1, 0.1, 200);
  private world = new Group();
  private globeAnchor = new Group();
  private tilt = new Group();
  private spin = new Group();
  private rings = new Group();
  private monogram?: Group;
  private monoMaterial?: MeshPhysicalMaterial;
  private earthMat?: ShaderMaterial;
  private atmoMat?: ShaderMaterial;
  private pointMats: ShaderMaterial[] = [];
  private globeScale = { value: 1 };
  private starsMat?: ShaderMaterial;
  private satellites: { mesh: Mesh; curve: EllipseCurve; speed: number; offset: number }[] = [];
  private marker?: Group;

  private mode: StageMode;
  private layout!: Layout;
  private from?: Layout;
  private to?: Layout;
  private transitionStart = 0;
  private transitionDur = 0;
  private transitionResolve?: () => void;

  private yaw = 0;
  private yawVel = 0;
  private tiltTarget = 0;
  private homeYaw: number;
  private homeTilt: number;
  private flyingHome = false;
  private pulse = 0;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private dragging = false;
  private lastX = 0;
  private running = false;
  private visible = true;
  private raf = 0;
  private last = 0;
  private time = 0;
  private dpr: number;
  private frameTimes: number[] = [];
  private reduced: boolean;
  private resizeObserver: ResizeObserver;
  private cleanup: (() => void)[] = [];

  constructor(private opts: StageOptions) {
    this.mode = opts.mode;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700;
    this.dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75);

    this.renderer = new WebGLRenderer({
      canvas: opts.canvas,
      antialias: this.dpr < 2,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.camera.position.set(0, 0, 7);
    this.scene.add(this.world);
    this.world.add(this.globeAnchor);
    this.globeAnchor.add(this.tilt);
    this.tilt.add(this.spin);
    this.globeAnchor.add(this.rings);

    // Face Visakhapatnam by default.
    this.homeYaw = Math.PI / 2 - (opts.home.lon + 180) * DEG;
    this.homeTilt = opts.home.lat * DEG;
    this.yaw = this.homeYaw + (this.mode === 'intro' ? -0.35 : 0.2);
    this.tiltTarget = this.homeTilt * 0.6;
    this.tilt.rotation.x = this.tiltTarget;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(opts.host);

    opts.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.stop();
      opts.host.classList.add('webgl-failed');
    });
  }

  async load() {
    const { onProgress } = this.opts;
    let done = 0;
    const tick = () => onProgress?.(++done / 3);
    const texPromise = new TextureLoader().loadAsync(url('/earth/earth-data.webp')).then((t) => { tick(); return t; });
    const landPromise = fetchFloats(url('/earth/land-points.bin')).then((d) => { tick(); return d; });
    const cityPromise = fetchFloats(url('/earth/cities.bin')).then((d) => { tick(); return d; });
    const [tex, land, cities] = await Promise.all([texPromise, landPromise, cityPromise]);
    tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());

    this.buildEarth(tex);
    this.buildLand(land);
    this.buildCities(cities);
    this.buildMarker();
    this.buildRings();
    this.buildStars();
    if (this.opts.monogram) this.buildMonogram();

    this.layout = this.computeLayout(this.mode);
    this.applyLayout(this.layout);
    this.resize();
    this.bindPointer();
  }

  /* ----- builders ----- */

  private buildEarth(tex: import('three').Texture) {
    const geo = new SphereGeometry(1, 96, 64);
    this.earthMat = new ShaderMaterial({
      uniforms: {
        uData: { value: tex }, uLight: { value: new Vector3(-0.6, 0.5, 0.65).normalize() }, uPulse: { value: 0 },
        uRim: { value: 1 }, uRimPow: { value: 3 },
      },
      vertexShader: earthVert,
      fragmentShader: earthFrag,
    });
    this.spin.add(new Mesh(geo, this.earthMat));

    this.atmoMat = new ShaderMaterial({
      uniforms: { uLight: this.earthMat.uniforms.uLight, uPulse: this.earthMat.uniforms.uPulse, uRim: this.earthMat.uniforms.uRim },
      vertexShader: atmoVert,
      fragmentShader: atmoFrag,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmo = new Mesh(new SphereGeometry(1.16, 64, 48), this.atmoMat);
    this.globeAnchor.add(atmo);
  }

  private pointsMaterial(color: string, size: number, nightOnly: boolean, additive: boolean) {
    const mat = new ShaderMaterial({
      uniforms: {
        uColor: { value: hexVec(color) },
        uScale: { value: size },
        uGlobe: this.globeScale,
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uLight: this.earthMat!.uniforms.uLight,
        uNightOnly: { value: nightOnly ? 1 : 0 },
      },
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
    });
    if (additive) mat.blending = AdditiveBlending;
    this.pointMats.push(mat);
    return mat;
  }

  private buildLand(data: Float32Array) {
    const n = data.length / 2;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    const v = new Vector3();
    for (let i = 0; i < n; i++) {
      latLonToVec3(data[i * 2], data[i * 2 + 1], 1.006, v);
      pos.set([v.x, v.y, v.z], i * 3);
      size[i] = 1;
      phase[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phase, 1));
    this.spin.add(new Points(geo, this.pointsMaterial('#e9c983', 9, false, false)));
  }

  private buildCities(data: Float32Array) {
    const n = data.length / 3;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    const v = new Vector3();
    for (let i = 0; i < n; i++) {
      latLonToVec3(data[i * 3], data[i * 3 + 1], 1.009, v);
      pos.set([v.x, v.y, v.z], i * 3);
      size[i] = 1.2 + data[i * 3 + 2] * 3.2;
      phase[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phase, 1));
    this.spin.add(new Points(geo, this.pointsMaterial('#ffb45e', 9, true, true)));
  }

  private buildMarker() {
    const g = new Group();
    const p = latLonToVec3(this.opts.home.lat, this.opts.home.lon, 1.012);
    g.position.copy(p);
    g.lookAt(p.clone().multiplyScalar(2));
    const core = new Mesh(new SphereGeometry(0.018, 16, 12), new ShaderMaterial({
      vertexShader: 'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'void main(){gl_FragColor=vec4(1.0,0.86,0.55,1.0);}',
    }));
    const ringMat = new ShaderMaterial({
      uniforms: { uT: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform float uT; void main(){ float a = (1.0 - uT) * 0.9; gl_FragColor = vec4(vec3(1.0,0.72,0.35)*a, a); }',
      transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
    });
    const ring = new Mesh(new RingGeometry(0.03, 0.04, 40), ringMat);
    ring.name = 'pulse';
    g.add(core, ring);
    this.marker = g;
    this.spin.add(g);
  }

  private buildRings() {
    const specs = [
      { rx: 1.42, ry: 1.42, rotX: 1.25, rotZ: 0.25, speed: 0.22, opacity: 0.4 },
      { rx: 1.75, ry: 1.62, rotX: 1.45, rotZ: -0.42, speed: -0.15, opacity: 0.28 },
      { rx: 2.15, ry: 1.95, rotX: 1.05, rotZ: 0.62, speed: 0.1, opacity: 0.2 },
    ];
    for (const s of specs) {
      const curve = new EllipseCurve(0, 0, s.rx, s.ry, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(220);
      const geo = new BufferGeometry().setFromPoints(pts.map((p) => new Vector3(p.x, p.y, 0)));
      const line = new LineLoop(geo, new LineBasicMaterial({ color: '#d6b26e', transparent: true, opacity: s.opacity, depthWrite: false }));
      const holder = new Group();
      holder.rotation.set(s.rotX, 0, s.rotZ);
      holder.add(line);
      const sat = new Mesh(new SphereGeometry(0.022, 12, 10), new MeshPhysicalMaterial({ color: '#f1dca6', emissive: '#d6b26e', emissiveIntensity: 1.2 }));
      holder.add(sat);
      this.satellites.push({ mesh: sat, curve, speed: s.speed, offset: Math.random() });
      this.rings.add(holder);
    }
  }

  private buildStars() {
    const small = window.innerWidth < 700;
    const n = small ? 600 : 1400;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    const v = new Vector3();
    for (let i = 0; i < n; i++) {
      v.randomDirection().multiplyScalar(18 + Math.random() * 30);
      pos.set([v.x, v.y, v.z - 10], i * 3);
      size[i] = 0.6 + Math.random() * Math.random() * 2.2;
      phase[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phase, 1));
    this.starsMat = new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: this.dpr } },
      vertexShader: starsVert,
      fragmentShader: starsFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      premultipliedAlpha: true,
    });
    this.scene.add(new Points(geo, this.starsMat));
  }

  private buildMonogram() {
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const geo = new ExtrudeGeometry(monogramShape(), {
      depth: 0.2, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.022, bevelSegments: 4, curveSegments: 64,
    });
    geo.translate(0, 0, -0.1);
    this.monoMaterial = new MeshPhysicalMaterial({
      color: '#d9ad62', metalness: 1, roughness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.2,
      envMapIntensity: 1.3, transparent: true,
    });
    const d = new Mesh(geo, this.monoMaterial);
    const dot = new Mesh(new SphereGeometry(0.17, 48, 32), this.monoMaterial);
    dot.position.set(1.92, -0.83, 0);
    const g = new Group();
    g.add(d, dot);
    // Pivot near the visual centre of "D." (+ the globe sits in its counter)
    g.children.forEach((c) => c.position.x -= 0.84);
    this.monogram = g;
    this.world.add(g);

    const key = new DirectionalLight('#fff1d6', 2.2);
    key.position.set(-3, 4, 5);
    const rim = new DirectionalLight('#ff9a45', 1.6);
    rim.position.set(4, -2, -3);
    this.scene.add(key, rim);
  }

  /* ----- layout ----- */

  private visibleSize(z = 0) {
    const h = 2 * Math.tan((this.camera.fov * DEG) / 2) * (this.camera.position.z - z);
    return { w: h * this.camera.aspect, h };
  }

  private computeLayout(mode: StageMode): Layout {
    const { w, h } = this.visibleSize();
    const portrait = w / h < 0.9;
    if (mode === 'intro') {
      // Emblem width ≈ 2.4 units at ds = 1, height 2.
      const ds = Math.min(1.4, (w * 0.82) / 2.45, (h * (portrait ? 0.36 : 0.47)) / 2);
      const dy = portrait ? h * 0.16 : h * 0.135;
      return {
        dx: 0, dy, dz: 0, ds, dRot: -0.18, dOpacity: 1,
        gx: (0.78 - 0.84) * ds, gy: dy, gz: -0.55 * ds, gs: 0.74 * ds,
        ringScale: 0.95, ringTilt: 0,
        light: new Vector3(-0.55, 0.45, 0.7).normalize(),
        spin: 0.09, rim: 1, rimPow: 3,
      };
    }
    if (mode === 'contact') {
      const gs = Math.min(w, h) * 0.3;
      return {
        dx: 0, dy: 0, dz: 0, ds: 1, dRot: 0, dOpacity: 0,
        gx: 0, gy: 0, gz: 0, gs, ringScale: 1, ringTilt: 0,
        light: new Vector3(-0.5, 0.45, 0.75).normalize(),
        spin: 0.03, rim: 1, rimPow: 3,
      };
    }
    // hero: a vast planet horizon rising from the bottom of the frame
    const gs = portrait ? w * 1.2 : Math.max(w * 0.6, h * 1.05);
    const visibleCap = portrait ? h * 0.1 : h * 0.17;
    return {
      dx: 0, dy: h * 0.35, dz: 3.2, ds: 1.6, dRot: 0.9, dOpacity: 0,
      gx: portrait ? 0 : w * 0.1, gy: -h / 2 - gs + visibleCap, gz: -1.2, gs,
      ringScale: 1, ringTilt: -0.55,
      light: new Vector3(0.12, 0.24, -1).normalize(),
      spin: 0.035, rim: 0.42, rimPow: 9,
    };
  }

  private applyLayout(l: Layout) {
    this.globeAnchor.position.set(l.gx, l.gy, l.gz);
    this.globeAnchor.scale.setScalar(l.gs);
    this.globeScale.value = l.gs;
    this.rings.scale.setScalar(l.ringScale);
    this.rings.rotation.x = l.ringTilt;
    if (this.earthMat) {
      this.earthMat.uniforms.uLight.value.copy(l.light);
      this.earthMat.uniforms.uRim.value = l.rim;
      this.earthMat.uniforms.uRimPow.value = l.rimPow;
    }
    if (this.monogram && this.monoMaterial) {
      this.monogram.position.set(l.dx, l.dy, l.dz);
      this.monogram.scale.setScalar(l.ds);
      this.monogram.rotation.y = l.dRot;
      this.monoMaterial.opacity = l.dOpacity;
      this.monogram.visible = l.dOpacity > 0.01;
    }
  }

  private lerpLayout(a: Layout, b: Layout, t: number): Layout {
    const L = MathUtils.lerp;
    return {
      gx: L(a.gx, b.gx, t), gy: L(a.gy, b.gy, t), gz: L(a.gz, b.gz, t), gs: L(a.gs, b.gs, t),
      dx: L(a.dx, b.dx, t), dy: L(a.dy, b.dy, t), dz: L(a.dz, b.dz, t), ds: L(a.ds, b.ds, t),
      dRot: L(a.dRot, b.dRot, t), dOpacity: L(a.dOpacity, b.dOpacity, Math.min(1, t * 1.6)),
      ringScale: L(a.ringScale, b.ringScale, t), ringTilt: L(a.ringTilt, b.ringTilt, t),
      light: a.light.clone().lerp(b.light, t).normalize(),
      spin: L(a.spin, b.spin, t),
      rim: L(a.rim, b.rim, t), rimPow: L(a.rimPow, b.rimPow, t),
    };
  }

  /** Animate (or jump) to another composition. Resolves when finished. */
  setMode(mode: StageMode, { instant = false, duration = 2200 } = {}) {
    this.mode = mode;
    if (mode === 'intro' && !this.monogram) this.buildMonogram();
    const target = this.computeLayout(mode);
    if (instant || this.reduced || !this.layout) {
      this.from = this.to = undefined;
      this.layout = target;
      this.applyLayout(target);
      this.renderOnce();
      return Promise.resolve();
    }
    this.from = this.layout;
    this.to = target;
    this.transitionStart = performance.now();
    this.transitionDur = duration;
    this.transitionResolve?.();
    return new Promise<void>((resolve) => { this.transitionResolve = resolve; });
  }

  faceHome() {
    this.flyingHome = true;
    this.yawVel = 0;
    // choose the nearest equivalent angle
    const twoPi = Math.PI * 2;
    this.homeYaw = this.yaw + ((((this.homeYaw - this.yaw) % twoPi) + twoPi + Math.PI) % twoPi) - Math.PI;
    this.tiltTarget = this.homeTilt;
  }

  celebrate() {
    this.pulse = 1;
    if (!this.reduced) this.yawVel += 3.2;
  }

  /* ----- interaction ----- */

  private bindPointer() {
    const targets = this.opts.interactionTargets ?? [this.opts.host];
    const onMove = (e: PointerEvent) => {
      this.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (this.dragging) {
        const dx = e.clientX - this.lastX;
        this.lastX = e.clientX;
        this.yawVel = dx * 0.006 * 60;
        this.yaw += dx * 0.006;
        this.flyingHome = false;
      }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a, button, input, textarea, select, label')) return;
      this.dragging = true;
      this.lastX = e.clientX;
      targets.forEach((t) => t.classList.add('is-dragging'));
    };
    const onUp = () => { this.dragging = false; targets.forEach((t) => t.classList.remove('is-dragging')); };
    window.addEventListener('pointermove', onMove, { passive: true });
    targets.forEach((t) => t.addEventListener('pointerdown', onDown));
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    const onCelebrate = () => this.celebrate();
    const onHome = () => this.faceHome();
    window.addEventListener('kd:celebrate', onCelebrate);
    window.addEventListener('kd:home', onHome);
    const onVis = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener('visibilitychange', onVis);
    this.cleanup.push(() => {
      window.removeEventListener('pointermove', onMove);
      targets.forEach((t) => t.removeEventListener('pointerdown', onDown));
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('kd:celebrate', onCelebrate);
      window.removeEventListener('kd:home', onHome);
      document.removeEventListener('visibilitychange', onVis);
    });
  }

  /** Pause rendering while the stage is scrolled out of view. */
  setVisible(v: boolean) {
    this.visible = v;
    if (v) this.start(); else this.stop();
  }

  /* ----- loop ----- */

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.opts.host;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const m of this.pointMats) m.uniforms.uScale.value = 9 * this.dpr * (h / 900);
    if (this.layout) {
      const target = this.computeLayout(this.mode);
      if (this.to) this.to = target; else { this.layout = target; this.applyLayout(target); }
    }
    this.renderOnce();
  }

  start() {
    if (this.running || !this.visible || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.frame(now);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private renderOnce() {
    if (!this.layout) return;
    this.renderer.render(this.scene, this.camera);
  }

  private adaptQuality(dt: number) {
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes.length = 0;
    if (avg > 0.024 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.resize();
    }
  }

  private frame(now: number) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.adaptQuality(dt);

    // Composition transition
    if (this.from && this.to) {
      const t = Math.min(1, (now - this.transitionStart) / this.transitionDur);
      this.layout = this.lerpLayout(this.from, this.to, easeInOutCubic(t));
      if (t >= 1) {
        this.layout = this.to;
        this.from = this.to = undefined;
        this.transitionResolve?.();
        this.transitionResolve = undefined;
      }
      this.applyLayout(this.layout);
    }

    // Globe spin: auto-rotation + drag inertia, or fly home
    if (this.flyingHome) {
      this.yaw = MathUtils.damp(this.yaw, this.homeYaw, 2.4, dt);
      if (Math.abs(this.yaw - this.homeYaw) < 0.002) this.flyingHome = false;
    } else if (!this.dragging) {
      this.yawVel = MathUtils.damp(this.yawVel, 0, 1.6, dt);
      this.yaw += (this.reduced ? 0 : this.layout.spin) * dt + this.yawVel * dt;
    }
    this.spin.rotation.y = this.yaw;
    this.tilt.rotation.x = MathUtils.damp(this.tilt.rotation.x, this.tiltTarget, 2, dt);

    // Parallax
    this.pointer.x = MathUtils.damp(this.pointer.x, this.pointer.tx, 3, dt);
    this.pointer.y = MathUtils.damp(this.pointer.y, this.pointer.ty, 3, dt);
    const amt = this.reduced ? 0 : 1;
    this.world.rotation.y = this.pointer.x * 0.06 * amt;
    this.world.rotation.x = this.pointer.y * 0.04 * amt;
    if (this.monogram && this.monogram.visible) {
      this.monogram.rotation.y = this.layout.dRot + this.pointer.x * 0.22 * amt + Math.sin(this.time * 0.5) * 0.04 * amt;
      this.monogram.rotation.x = this.pointer.y * 0.12 * amt;
    }

    // Orbits and satellites
    if (!this.reduced) this.rings.rotation.y += dt * 0.04;
    for (const s of this.satellites) {
      const p = s.curve.getPoint((((this.time * s.speed * 0.1 + s.offset) % 1) + 1) % 1);
      s.mesh.position.set(p.x, p.y, 0);
    }

    // Marker pulse
    const ring = this.marker?.getObjectByName('pulse') as Mesh | undefined;
    if (ring) {
      const t = (this.time * 0.6) % 1;
      ring.scale.setScalar(1 + t * 3.5);
      ((ring.material as ShaderMaterial).uniforms.uT.value = t);
    }

    // Uniforms
    this.pulse = MathUtils.damp(this.pulse, 0, 1.4, dt);
    if (this.earthMat) this.earthMat.uniforms.uPulse.value = this.pulse;
    for (const m of this.pointMats) m.uniforms.uTime.value = this.time;
    if (this.starsMat) this.starsMat.uniforms.uTime.value = this.time;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.resizeObserver.disconnect();
    this.cleanup.forEach((fn) => fn());
    this.renderer.dispose();
  }
}
