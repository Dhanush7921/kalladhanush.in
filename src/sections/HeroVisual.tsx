import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMotion';
import { landPointsUrl } from '../content/assets';

/** Must match the hero's wide-layout media query in Hero.css. */
export const HERO_WIDE = 1100;

type Quality = 'high' | 'low';

/** Decide whether (and how richly) to run WebGL on this device. */
function detectQuality(): Quality | null {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return null;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return null;
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return null;
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 4;
  if (cores <= 2 || memory <= 2) return null;
  const compact = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  return compact || cores <= 4 || memory < 4 ? 'low' : 'high';
}

/** Lightweight CSS/SVG globe — shown first, kept for reduced motion, no-WebGL and low-power devices. */
function FallbackOrbit({ variant, rx, ry, dot }: { variant: 'a' | 'b'; rx: number; ry: number; dot?: boolean }) {
  return (
    <span className={`globe-fallback__orbit globe-fallback__orbit--${variant}`}>
      <svg viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <linearGradient id={`gf-ring-${variant}`} x1="0" x2="1">
            <stop offset="0" stopColor="#ffd700" stopOpacity="0" />
            <stop offset=".5" stopColor="#ffcf5a" stopOpacity=".7" />
            <stop offset="1" stopColor="#ff8c00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="200" rx={rx} ry={ry} fill="none" stroke={`url(#gf-ring-${variant})`} strokeWidth="1" />
        {dot && <circle cx={200 + rx} cy="200" r="3" fill="#ffe08a" />}
      </svg>
    </span>
  );
}

function GlobeFallback() {
  const lats = [-60, -30, 0, 30, 60];
  const lons = [20, 50, 80];
  return (
    <svg className="globe-fallback" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="gf-body" cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#2b1806" />
          <stop offset=".42" stopColor="#0d0906" />
          <stop offset=".8" stopColor="#050505" />
        </radialGradient>
        <radialGradient id="gf-rim" cx="50%" cy="50%" r="50%">
          <stop offset=".86" stopColor="#ff8c00" stopOpacity="0" />
          <stop offset=".97" stopColor="#ff9a1a" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff8c00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gf-halo" cx="50%" cy="50%" r="50%">
          <stop offset=".68" stopColor="#ff8c00" stopOpacity=".18" />
          <stop offset="1" stopColor="#ff8c00" stopOpacity="0" />
        </radialGradient>
        <clipPath id="gf-clip">
          <circle cx="200" cy="200" r="150" />
        </clipPath>
      </defs>
      <circle cx="200" cy="200" r="198" fill="url(#gf-halo)" />
      <circle cx="200" cy="200" r="150" fill="url(#gf-body)" />
      <g clipPath="url(#gf-clip)" fill="none" stroke="#ffbe5a" strokeOpacity=".14" strokeWidth=".8">
        {lats.map((lat) => {
          const rad = (lat * Math.PI) / 180;
          return <ellipse key={lat} cx="200" cy={200 - 150 * Math.sin(rad)} rx={150 * Math.cos(rad)} ry={22 * Math.cos(rad)} />;
        })}
        {lons.map((lon) => (
          <ellipse key={lon} cx="200" cy="200" rx={150 * Math.sin((lon * Math.PI) / 180)} ry="150" />
        ))}
        <line x1="200" y1="50" x2="200" y2="350" />
      </g>
      <g clipPath="url(#gf-clip)" fill="#ffc94d">
        {Array.from({ length: 70 }, (_, i) => {
          const a = i * 2.39996;
          const r = 140 * Math.sqrt((i + 0.5) / 70);
          const x = 200 + Math.cos(a) * r;
          const y = 200 + Math.sin(a) * r * 0.96;
          return <circle key={i} cx={x} cy={y} r={0.9 + (i % 3) * 0.35} opacity={0.25 + ((i * 37) % 50) / 100} />;
        })}
      </g>
      <circle cx="200" cy="200" r="150" fill="url(#gf-rim)" />
    </svg>
  );
}

/** `active` turns true once the opening animation has handed over, so the two never compete for the GPU. */
export default function HeroVisual({ active }: { active: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el || reduced) return;
    const quality = detectQuality();
    if (!quality) return;
    if (!active) {
      // Warm the module cache during the intro; build the scene afterwards.
      const warm = window.setTimeout(() => void import('../three/globeScene').catch(() => undefined), 600);
      return () => window.clearTimeout(warm);
    }

    let cancelled = false;
    let handle: { dispose: () => void } | undefined;
    const load = () => {
      import('../three/globeScene')
        .then(({ createGlobeScene }) => {
          if (cancelled) return;
          handle = createGlobeScene(el, {
            quality,
            landUrl: landPointsUrl,
            wideBreakpoint: HERO_WIDE,
            onReady: () => !cancelled && setLive(true),
            onError: () => setLive(false),
          });
        })
        .catch(() => setLive(false));
    };
    const idle = 'requestIdleCallback' in window;
    const id = idle ? window.requestIdleCallback(load, { timeout: 1400 }) : window.setTimeout(load, 200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      handle?.dispose();
      setLive(false);
    };
  }, [reduced, active]);

  return (
    <div className={`hero-visual${live ? ' is-live' : ''}`} aria-hidden="true">
      <div className="globe-fallback-wrap">
        <GlobeFallback />
        <FallbackOrbit variant="a" rx={196} ry={58} dot />
        <FallbackOrbit variant="b" rx={178} ry={42} />
      </div>
      <div ref={mount} className="hero-visual__webgl" />
    </div>
  );
}
