/**
 * Interactive 3D skill universe: words on a Fibonacci sphere, projected with
 * real perspective, rotating under drag with inertia. The tab dashboard is the
 * accessible equivalent and is kept in sync.
 */
export function initSkillUniverse(root: HTMLElement) {
  const sphere = root.querySelector<HTMLElement>('[data-sphere]');
  if (!sphere) return;
  const words = [...sphere.querySelectorAll<HTMLElement>('.word')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = words.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = words.map((_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * golden;
    return [Math.cos(t) * r, y, Math.sin(t) * r];
  });

  let rx = -0.25, ry = 0, vx = 0, vy = reduced ? 0 : 0.18;
  let dragging = false, lx = 0, ly = 0, visible = false, raf = 0, last = 0;
  const radiusFor = () => sphere.clientWidth * (sphere.clientWidth < 440 ? 0.33 : 0.38);
  let radius = radiusFor();

  const render = () => {
    const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    for (let i = 0; i < n; i++) {
      const [x0, y0, z0] = pts[i];
      const x1 = x0 * cy + z0 * sy;
      const z1 = -x0 * sy + z0 * cy;
      const y2 = y0 * cx - z1 * sx;
      const z2 = y0 * sx + z1 * cx;
      const persp = 3 / (3 - z2);
      const s = 0.62 + 0.5 * ((z2 + 1) / 2);
      const el = words[i];
      el.style.transform = `translate(-50%, -50%) translate3d(${(x1 * radius * persp).toFixed(1)}px, ${(y2 * radius * persp).toFixed(1)}px, 0) scale(${(s * persp * 0.85).toFixed(3)})`;
      el.style.opacity = (0.18 + 0.82 * ((z2 + 1) / 2)).toFixed(2);
      el.style.zIndex = String(Math.round((z2 + 1) * 50));
    }
  };

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (!dragging) {
      vy += ((reduced ? 0 : 0.18) - vy) * Math.min(1, dt * 0.8);
      vx += (0 - vx) * Math.min(1, dt * 2);
    }
    ry += vy * dt;
    rx += vx * dt;
    rx = Math.max(-1.1, Math.min(1.1, rx));
    render();
    if (visible && (!reduced || dragging || Math.abs(vy) > 0.001)) raf = requestAnimationFrame(loop);
  };
  const kick = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop); };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick(); else cancelAnimationFrame(raf);
  }).observe(sphere);
  new ResizeObserver(() => { radius = radiusFor(); render(); }).observe(sphere);

  sphere.addEventListener('pointerdown', (e) => {
    dragging = true; lx = e.clientX; ly = e.clientY;
    sphere.setPointerCapture(e.pointerId);
    kick();
  });
  sphere.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    vy = (e.clientX - lx) * 0.35; vx = -(e.clientY - ly) * 0.25;
    ry += (e.clientX - lx) * 0.008; rx -= (e.clientY - ly) * 0.006;
    lx = e.clientX; ly = e.clientY;
  });
  const end = () => { dragging = false; };
  sphere.addEventListener('pointerup', end);
  sphere.addEventListener('pointercancel', end);

  // Tabs <-> sphere highlight
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-group-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-group-panel]')];
  const highlight = (group: string | null) => {
    words.forEach((w) => {
      w.classList.toggle('is-active', w.dataset.group === group);
      w.classList.toggle('is-dim', !!group && w.dataset.group !== group);
    });
  };
  const select = (group: string, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.groupTab === group;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => { p.hidden = p.dataset.groupPanel !== group; });
    highlight(group);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t.dataset.groupTab!));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      let j = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % tabs.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') j = 0;
      if (k === 'End') j = tabs.length - 1;
      if (j >= 0) { e.preventDefault(); select(tabs[j].dataset.groupTab!, true); }
    });
  });
  words.forEach((w) => w.addEventListener('click', () => {
    if (tabs.length) select(w.dataset.group!); else highlight(w.dataset.group!);
  }));
  if (tabs.length) highlight(tabs[0].dataset.groupTab!);
  render();
}
