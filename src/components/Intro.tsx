import { useCallback, useEffect, useRef, useState } from 'react';
import { kdLogo } from '../content/assets';
import { site } from '../content/portfolio';
import Icon from './Icon';
import './Intro.css';

const INTRO_KEY = 'kd-intro-seen';

/** Play once per browser session; never for reduced-motion users or deep links. */
export function shouldPlayIntro(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.location.hash && window.location.hash !== '#home') return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return true;
  }
}

export function resetIntro() {
  try {
    sessionStorage.removeItem(INTRO_KEY);
  } catch {
    /* storage unavailable — intro will simply play */
  }
}

interface Particle {
  sx: number;
  sy: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  delay: number;
  dur: number;
  r: number;
  hue: number;
  light: number;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'assemble' | 'reveal' | 'leave'>('assemble');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    setPhase('leave');
    window.setTimeout(onDone, 640);
  }, [onDone]);

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('is-locked');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [finish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const logo = logoRef.current;
    const ctx = canvas?.getContext('2d');
    let raf = 0;
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    if (!canvas || !ctx || !logo) {
      setPhase('reveal');
      later(finish, 1800);
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const box = logo.getBoundingClientRect();
    const size = logo.offsetWidth; // layout size (ignores the entrance scale transform)
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const count = W < 700 ? 900 : 1500;

    const img = new Image();
    img.decoding = 'async';
    img.src = kdLogo.large;

    const build = (): Particle[] => {
      const S = 150;
      const pts: [number, number, number][] = [];
      const off = document.createElement('canvas');
      off.width = off.height = S;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (octx && img.naturalWidth) {
        octx.drawImage(img, 0, 0, S, S);
        const d = octx.getImageData(0, 0, S, S).data;
        for (let y = 0; y < S; y += 2) {
          for (let x = 0; x < S; x += 2) {
            const i = (y * S + x) * 4;
            const l = (Math.max(d[i], d[i + 1], d[i + 2]) / 255) * (d[i + 3] / 255);
            if (l > 0.38) pts.push([x / S, y / S, l]);
          }
        }
      }
      // Fallback silhouette: a ring, if the image could not be sampled.
      if (pts.length < 60) {
        for (let k = 0; k < 600; k++) {
          const a = (k / 600) * Math.PI * 2;
          pts.push([0.5 + Math.cos(a) * 0.4, 0.5 + Math.sin(a) * 0.4, 0.8]);
        }
      }
      for (let k = pts.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [pts[k], pts[j]] = [pts[j], pts[k]];
      }
      const R = Math.hypot(W, H) * 0.6;
      return pts.slice(0, count).map(([x, y, l]) => {
        const a = Math.random() * Math.PI * 2;
        const sx = cx + Math.cos(a) * R * (0.75 + Math.random() * 0.4);
        const sy = cy + Math.sin(a) * R * (0.75 + Math.random() * 0.4);
        const tx = cx + (x - 0.5) * size;
        const ty = cy + (y - 0.5) * size;
        // Swirl: control point rotated off the straight path → curved light trails
        const swirl = a + 1.1;
        const mid = R * 0.45;
        return {
          sx,
          sy,
          cx: cx + Math.cos(swirl) * mid,
          cy: cy + Math.sin(swirl) * mid,
          tx,
          ty,
          delay: 120 + Math.random() * 520,
          dur: 1050 + Math.random() * 520,
          r: 0.6 + l * 1.1,
          hue: 32 + Math.random() * 16,
          light: 52 + l * 22,
        };
      });
    };

    const run = () => {
      if (cancelled) return;
      const ps = build();
      const t0 = performance.now();
      let revealed = false;
      const frame = (now: number) => {
        if (cancelled) return;
        const t = now - t0;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(5,5,5,0.24)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        const fadeOut = t > 1800 ? Math.max(0, 1 - (t - 1800) / 550) : 1;
        for (const p of ps) {
          const k = Math.min(1, Math.max(0, (t - p.delay) / p.dur));
          if (k <= 0) continue;
          const e = ease(k);
          const u = 1 - e;
          const x = u * u * p.sx + 2 * u * e * p.cx + e * e * p.tx;
          const y = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ty;
          const alpha = Math.min(1, k * 3) * fadeOut * (k < 1 ? 0.85 : 0.65);
          ctx.fillStyle = `hsla(${p.hue},100%,${p.light}%,${alpha})`;
          const s = p.r * (k < 1 ? 1.4 : 1);
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
        if (!revealed && t > 1550) {
          revealed = true;
          setPhase('reveal');
        }
        if (t < 2450) raf = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, W, H);
      };
      raf = requestAnimationFrame(frame);
      later(finish, 3600);
    };

    img.decode().then(run, run);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [finish]);

  return (
    <div className={`intro intro--${phase}`} role="dialog" aria-modal="true" aria-label="Opening animation">
      <canvas ref={canvasRef} className="intro__canvas" aria-hidden="true" />
      <div className="intro__center">
        <div ref={logoRef} className="intro__logo">
          <img src={kdLogo.large} alt="KD monogram" width={640} height={640} />
          <span className="intro__shine" style={{ WebkitMaskImage: `url(${kdLogo.large})`, maskImage: `url(${kdLogo.large})` }} aria-hidden="true" />
        </div>
        <p className="intro__name">{site.nameUpper}</p>
        <p className="intro__tagline">{site.tagline}</p>
      </div>
      <button ref={skipRef} type="button" className="intro__skip" onClick={finish}>
        Skip intro <Icon name="arrowRight" />
      </button>
    </div>
  );
}
