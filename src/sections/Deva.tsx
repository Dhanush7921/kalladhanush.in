import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { usePrefersReducedMotion, useReveal } from '../hooks/useMotion';
import emblemImg from '../assets/images/deva-emblem.webp';
import plateImg from '../assets/images/deva-plate.webp';
import type { DevaEmblemHandle } from '../three/devaEmblem';
import './Deva.css';

/** The transformation experience lives beside the portfolio, under the same domain. */
const DEVA_URL = 'deva/';

const facts = [
  { value: '42', label: 'Days' },
  { value: '95', label: 'kg at day one' },
  { value: '20K', label: 'Steps a day' },
  { value: '5', label: 'Training days a week' },
];

function detectQuality(): 'high' | 'low' | null {
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

export default function Deva() {
  const ref = useReveal<HTMLElement>();
  const mount = useRef<HTMLSpanElement>(null);
  const logo = useRef<HTMLAnchorElement>(null);
  const handle = useRef<DevaEmblemHandle | null>(null);
  const leaving = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [live, setLive] = useState(false);
  const [impact, setImpact] = useState(false);

  // Build the WebGL emblem only when the section is close, only on capable devices.
  useEffect(() => {
    const section = ref.current;
    const el = mount.current;
    if (!section || !el || reduced || !('IntersectionObserver' in window)) return;
    const quality = detectQuality();
    if (!quality) return;

    let cancelled = false;
    let requested = false;
    let inView = false;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || requested) return;
        requested = true;
        near.disconnect();
        import('../three/devaEmblem')
          .then(({ createDevaEmblem }) => {
            if (cancelled) return;
            handle.current = createDevaEmblem(el, {
              quality,
              onReady: () => !cancelled && setLive(true),
              onError: () => setLive(false),
            });
            handle.current.setVisible(inView);
          })
          .catch(() => setLive(false));
      },
      { rootMargin: '500px 0px' },
    );
    const seen = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      handle.current?.setVisible(inView);
    });
    near.observe(section);
    seen.observe(section);

    const move = (e: PointerEvent) => {
      const r = (logo.current ?? section).getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const y = ((r.top + r.height / 2) - e.clientY) / (window.innerHeight / 2);
      handle.current?.setPointer(x, y);
    };
    section.addEventListener('pointermove', move, { passive: true });

    return () => {
      cancelled = true;
      near.disconnect();
      seen.disconnect();
      section.removeEventListener('pointermove', move);
      handle.current?.dispose();
      handle.current = null;
      setLive(false);
    };
  }, [ref, reduced]);

  // Coming back with the browser's back button: clear the impact state.
  useEffect(() => {
    const reset = () => {
      window.clearTimeout(leaving.current);
      setImpact(false);
    };
    window.addEventListener('pageshow', reset);
    return () => {
      window.removeEventListener('pageshow', reset);
      window.clearTimeout(leaving.current);
    };
  }, []);

  const hover = (on: boolean) => () => handle.current?.setHover(on);

  const enter = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // plain navigation
    e.preventDefault();
    if (impact) return;
    setImpact(true);
    handle.current?.impact();
    leaving.current = window.setTimeout(() => window.location.assign(DEVA_URL), 520);
  };

  return (
    <section id="deva" ref={ref} className={`section deva${impact ? ' is-impact' : ''}`} aria-labelledby="deva-title">
      <div className="deva__plate" aria-hidden="true" style={{ backgroundImage: `url(${plateImg})` }} />
      <div className="deva__smoke" aria-hidden="true" />
      <div className="container deva__grid">
        <div className="deva__copy">
          <p className="deva__eyebrow" data-reveal>
            <span className="deva__eyebrow-line" />
            DEVA — The Transformation
          </p>
          <h2 id="deva-title" className="deva__title" data-reveal style={{ ['--delay' as string]: 80 }}>
            <span className="deva__title-old">Dhanush</span>
            <span className="deva__title-arrow" aria-hidden="true">
              <svg viewBox="0 0 64 24" focusable="false">
                <path d="M0 9h40V2l24 10-24 10v-7H0z" />
              </svg>
            </span>
            <span className="visually-hidden"> to </span>
            <span className="deva__title-new">Deva</span>
          </h2>
          <p className="deva__pulse" data-reveal style={{ ['--delay' as string]: 140 }} aria-hidden="true">
            <svg viewBox="0 0 320 28" preserveAspectRatio="none" focusable="false">
              <path d="M0 14h96l8-10 10 22 9-18 6 6h62l8-10 10 22 9-18 6 6h96" pathLength={1} />
            </svg>
          </p>
          <p className="deva__lead" data-reveal style={{ ['--delay' as string]: 180 }}>
            Every name has a before. From 9 November to 20 December 2026 I am forging the after — forty-two days of logged fuel,
            twenty thousand steps and iron, tracked in the open inside a cinematic world I built for it.
          </p>
          <ul className="deva__facts" role="list" data-reveal style={{ ['--delay' as string]: 240 }}>
            {facts.map((f) => (
              <li key={f.label}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
          <p data-reveal style={{ ['--delay' as string]: 300 }}>
            <a className="deva__cta" href={DEVA_URL} onClick={enter} onPointerEnter={hover(true)} onPointerLeave={hover(false)} onFocus={hover(true)} onBlur={hover(false)}>
              <span>Enter the Transformation</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </p>
        </div>

        {/* The reveal class lives on a wrapper: React owns the link's className (is-live), so it must not carry it. */}
        <div className="deva__stage" data-reveal="scale">
        <a
          ref={logo}
          className={`deva__logo${live ? ' is-live' : ''}`}
          href={DEVA_URL}
          onClick={enter}
          onPointerEnter={hover(true)}
          onPointerLeave={hover(false)}
          onFocus={hover(true)}
          onBlur={hover(false)}
          aria-label="Enter the Transformation — open DHANUSH to DEVA"
        >
          <span className="deva__glow" aria-hidden="true" />
          <span className="deva__ring" aria-hidden="true" />
          <img className="deva__emblem" src={emblemImg} width={1000} height={514} alt="" loading="lazy" decoding="async" />
          <span ref={mount} className="deva__webgl" aria-hidden="true" />
          <span className="deva__shock" aria-hidden="true" />
        </a>
        </div>
      </div>
    </section>
  );
}
