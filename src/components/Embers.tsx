import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useMotion';

/** Soft orange-gold particles drifting upward. Canvas 2D, runs only while visible. */
export default function Embers({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !parent || !ctx || prefersReducedMotion()) return;

    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sctx = sprite.getContext('2d');
    if (!sctx) return;
    const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,236,170,1)');
    g.addColorStop(0.25, 'rgba(255,190,70,0.75)');
    g.addColorStop(1, 'rgba(255,120,0,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 32, 32);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const count = Math.round((window.innerWidth < 700 ? 16 : 34) * density);
    const ps = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 4 + Math.random() * 10,
      v: 0.006 + Math.random() * 0.018,
      sway: Math.random() * Math.PI * 2,
      a: 0.15 + Math.random() * 0.45,
    }));

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    let raf = 0;
    let last = 0;
    let t = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of ps) {
        p.y -= p.v * dt * (h > 0 ? 600 / h : 1);
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        const x = (p.x + Math.sin(t * 0.4 + p.sway) * 0.012) * w;
        const y = p.y * h;
        const edge = Math.min(1, p.y * 4, (1 - p.y) * 4);
        ctx.globalAlpha = p.a * Math.max(0, edge) * (0.75 + 0.25 * Math.sin(t * 1.3 + p.sway));
        ctx.drawImage(sprite, x - p.s / 2, y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    };

    let running = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(parent);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [density]);

  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}
