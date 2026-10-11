/**
 * Homepage orchestration: loads the 3D stage lazily, runs the intro
 * (START / SKIP / replay), remembers that the visitor has seen it, and
 * pauses WebGL when the hero is off-screen.
 */
import { site } from '../data/site';
import type { GlobeStage } from './globe';

const STORAGE_KEY = 'kd-intro-done';
const root = document.documentElement;

function remember() {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode: ignore */ }
}

function cleanIntroParam() {
  if (/[?&]intro=1\b/.test(location.search)) {
    const params=new URLSearchParams(location.search); params.delete('intro'); history.replaceState(null, '', location.pathname + (params.size ? '?'+params : '') + location.hash);
  }
}

export function initHome() {
  const host = document.querySelector<HTMLElement>('[data-globe-host]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-globe-canvas]');
  const overlay = document.querySelector<HTMLElement>('[data-intro-overlay]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!host || !canvas || !hero) return;

  const introActive = () => root.classList.contains('intro-pending');
  let stage: GlobeStage | undefined;
  let leaving = false;

  const bar = overlay?.querySelector<SVGCircleElement>('[data-intro-bar]');
  const pct = overlay?.querySelector<HTMLElement>('[data-intro-pct]');
  const setProgress = (f: number) => {
    const v = Math.round(f * 100);
    bar?.style.setProperty('--pct', String(v));
    if (pct) pct.textContent = String(v);
  };

  const markReady = () => {
    overlay?.classList.add('intro-ready');
    host.classList.add('stage-ready');
    if (introActive()) {
      overlay?.querySelector<HTMLButtonElement>('[data-intro-start]')?.focus({ preventScroll: true });
    }
  };

  const finish = () => {
    root.classList.remove('intro-pending', 'intro-leaving');
    leaving = false;
    remember();
    cleanIntroParam();
    window.scrollTo({ top: 0 });
    document.getElementById('hero-title')?.focus({ preventScroll: true });
  };

  const start = async () => {
    if (leaving || !introActive()) return;
    leaving = true;
    window.kdSound?.chime();
    root.classList.add('intro-leaving');
    if (stage) {
      const transition = stage.setMode('hero', { duration: 2400 });
      // Reveal the hero while the planet settles into the horizon.
      window.setTimeout(() => root.classList.remove('intro-pending'), 900);
      await transition;
    }
    finish();
  };

  const skip = () => {
    if (!introActive()) return;
    stage?.setMode('hero', { instant: true });
    finish();
  };

  const replay = () => {
    window.scrollTo({ top: 0 });
    root.classList.remove('intro-leaving');
    root.classList.add('intro-pending');
    stage?.setMode('intro', { instant: true });
    if (stage || root.classList.contains('no-webgl')) markReady();
  };
  window.kdIntro = { replay };

  overlay?.querySelector('[data-intro-start]')?.addEventListener('click', start);
  overlay?.querySelector('[data-intro-skip]')?.addEventListener('click', skip);
  window.addEventListener('keydown', (e) => {
    if (!introActive()) return;
    if (e.key === 'Escape') skip();
    if (e.key === 'Tab') {
      const buttons = [...(overlay?.querySelectorAll<HTMLButtonElement>('button') || [])];
      const i=buttons.indexOf(document.activeElement as HTMLButtonElement);
      e.preventDefault(); buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();
    }
  });

  const fallback = () => {
    root.classList.add('no-webgl');
    setProgress(1);
    markReady();
  };

  import('./globe')
    .then(async ({ GlobeStage, webglAvailable }) => {
      if (!webglAvailable()) return fallback();
      setProgress(0.1);
      try {
        stage = new GlobeStage({
          canvas,
          host,
          interactionTargets: overlay ? [overlay, hero] : [hero],
          mode: introActive() ? 'intro' : 'hero',
          monogram: introActive(),
          home: { lat: site.location.lat, lon: site.location.lon },
          onProgress: (f) => setProgress(0.1 + f * 0.9),
        });
        await stage.load();
      } catch (err) {
        console.warn('3D stage unavailable, using fallback.', err);
        stage?.dispose();
        stage = undefined;
        host.classList.add('webgl-failed');
        return fallback();
      }
      const io = new IntersectionObserver(([entry]) => stage?.setVisible(entry.isIntersecting), { threshold: 0 });
      io.observe(hero);
      stage.start();
      requestAnimationFrame(markReady);
    })
    .catch((err) => {
      console.warn('3D module failed to load.', err);
      fallback();
    });
}

