/**
 * Site-wide UI behaviour: header state, scroll progress, menu, chapter rail,
 * reveals, toast, easter eggs and the optional ambient sound.
 */
import { AmbientSound } from './sound';
import { url } from '../lib/url';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-reduced');

let toastTimer = 0;
export function toast(message: string, ms = 3600) {
  const el = document.querySelector<HTMLElement>('.toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { el.hidden = true; }, ms);
}

function initScroll() {
  const root = document.documentElement;
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = root.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    root.style.setProperty('--progress', p.toFixed(4));
    root.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initMenu() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !openBtn) return;
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.addEventListener('click', () => {
    dialog.showModal();
    openBtn.setAttribute('aria-expanded', 'true');
  });
  dialog.querySelector('[data-menu-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
  });
  // Close after choosing an in-page link
  dialog.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

function initReplayIntro() {
  document.querySelectorAll<HTMLButtonElement>('[data-replay-intro]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector<HTMLDialogElement>('[data-menu]')?.close();
      if (document.documentElement.dataset.intro === 'enabled' && window.kdIntro) {
        window.kdIntro.replay();
      } else {
        location.href = url('/?intro=1');
      }
    });
  });
}

function initChapterRail() {
  const rail = document.querySelector('[data-chapter-rail]');
  if (!rail) return;
  const links = new Map<string, HTMLAnchorElement>();
  rail.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]').forEach((a) => links.set(a.dataset.chapterLink!, a));
  const sections = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.get(entry.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach((el) => io.observe(el));
}

function initEasterEggs() {
  // 1) Type "deva" anywhere outside a form field.
  let buffer = '';
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-4);
    if (buffer === 'deva') {
      buffer = '';
      toast('Deva says hello. Beyond Vision. Into Reality.');
      window.dispatchEvent(new CustomEvent('kd:celebrate'));
    }
  });

  // 2) Triple-click the D. monogram to fly home to Visakhapatnam.
  const mono = document.querySelector<HTMLElement>('[data-monogram]');
  let clicks = 0;
  let clickTimer = 0;
  mono?.addEventListener('click', (e) => {
    clicks += 1;
    window.clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => { clicks = 0; }, 600);
    if (clicks >= 3) {
      clicks = 0;
      if (document.querySelector('[data-globe]')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('kd:home'));
        toast('Home base: Visakhapatnam, India.');
      }
    }
  });

  // 3) A note for the curious.
  console.log('%cD.%c Kalla Dhanush — Beyond Vision. Into Reality.\nCurious? The source is on GitHub: https://github.com/Dhanush7921/kalladhanush.in',
    'font: 700 28px serif; color: #d6b26e', 'font: 12px sans-serif; color: #bdb3a2');
}

function initSound() {
  const btn = document.querySelector<HTMLButtonElement>('[data-sound-toggle]');
  if (!btn || !AmbientSound.supported()) return;
  btn.hidden = false;
  const sound = new AmbientSound();
  window.kdSound = sound;
  btn.addEventListener('click', async () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    if (on) await sound.start(); else sound.stop();
    toast(on ? 'Ambient sound on.' : 'Ambient sound off.', 1800);
  });
}

function initTilt() {
  if (reduceMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    });
  });
}

export function initUI() {
  initTilt();
  initScroll();
  initMenu();
  initReplayIntro();
  initChapterRail();
  initReveal();
  initEasterEggs();
  initSound();
}

declare global {
  interface Window {
    kdIntro?: { replay: () => void };
    kdSound?: AmbientSound;
  }
}

