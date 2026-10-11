import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { disciplines } from '../content/portfolio';
import { KDMark, SectionHeading } from '../components/UI';
import Icon from '../components/Icon';
import { prefersReducedMotion, useReveal } from '../hooks/useMotion';
import './Skills.css';

const depthLevel: Record<string, number> = {
  'Applied in projects': 3,
  'Hands-on practice': 2,
  'Creative practice': 2,
  'Academic focus': 2,
  Mindset: 0,
};

/** Decorative orbital map of the disciplines (pointer users); the list beside it is the accessible control. */
function Orbit({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const paused = useRef(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    let angle = 0;
    let last = 0;
    let running = false;
    const reduce = prefersReducedMotion();

    const place = () => {
      const size = el.clientWidth;
      const cx = size / 2;
      const cy = el.clientHeight / 2;
      nodes.current.forEach((node, i) => {
        if (!node) return;
        const inner = i < 4;
        const rx = size * (inner ? 0.25 : 0.44);
        const ry = rx * 0.5;
        const base = ((inner ? i : i - 4) / 4) * Math.PI * 2 + (inner ? 0.4 : 0);
        const a = base + angle * (inner ? 1 : -0.7);
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const depth = (Math.sin(a) + 1) / 2; // 0 back … 1 front
        const scale = 0.78 + depth * 0.32;
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        node.style.zIndex = String(Math.round(depth * 10) + (depth > 0.5 ? 10 : 0));
        node.style.opacity = (0.55 + depth * 0.45).toFixed(2);
      });
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!paused.current) angle += dt * 0.09;
      place();
    };

    place();
    if (reduce) {
      const ro = new ResizeObserver(place);
      ro.observe(el);
      return () => ro.disconnect();
    }
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
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="orbit"
      aria-hidden="true"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <svg className="orbit__rings" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="orbit-ring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffbe5a" stopOpacity=".12" />
            <stop offset="1" stopColor="#ffd24a" stopOpacity=".6" />
          </linearGradient>
        </defs>
        {/* container is 1 : 0.72 — vertical radii are rescaled so rings match the node paths */}
        <ellipse cx="50" cy="50" rx="25" ry="17.36" fill="none" stroke="url(#orbit-ring)" strokeWidth=".25" vectorEffect="non-scaling-stroke" />
        <ellipse cx="50" cy="50" rx="44" ry="30.56" fill="none" stroke="url(#orbit-ring)" strokeWidth=".25" vectorEffect="non-scaling-stroke" />
        <ellipse cx="50" cy="50" rx="34.5" ry="23.96" fill="none" stroke="#ffbe5a" strokeOpacity=".08" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="orbit__core">
        <KDMark size={88} decorative />
      </div>
      {disciplines.map((d, i) => (
        <button
          key={d.id}
          ref={(n) => {
            nodes.current[i] = n;
          }}
          type="button"
          tabIndex={-1}
          className={`orbit__node${active === i ? ' is-active' : ''}`}
          onClick={() => onPick(i)}
        >
          <span className="orbit__icon">
            <Icon name={d.icon} />
          </span>
          <span className="orbit__name">{d.short}</span>
        </button>
      ))}
    </div>
  );
}

export default function Skills() {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const d = disciplines[active];
  const level = depthLevel[d.depth] ?? 0;

  const onKey = (e: ReactKeyboardEvent, i: number) => {
    const n = disciplines.length;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <section id="skills" ref={ref} className="section skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading
          index="04"
          label="Skills & Capabilities"
          id="skills-title"
          title={['Where Technology Meets', { em: 'Creativity' }]}
          lead="Eight disciplines, one way of working. Depth is described honestly — by how each skill is actually used, not by self-scored percentages."
          center
        />

        <div className="skills__layout">
          <div className="skills__visual" data-reveal="scale">
            <Orbit active={active} onPick={setActive} />
            <p className="skills__legend" aria-hidden="true">
              <span>Inner orbit · Technology</span>
              <span>Outer orbit · Creativity</span>
            </p>
          </div>

          <div className="skills__panel" data-reveal>
            <div className="skills__tabs" role="tablist" aria-label="Disciplines" aria-orientation="vertical">
              {disciplines.map((item, i) => (
                <button
                  key={item.id}
                  ref={(n) => {
                    tabs.current[i] = n;
                  }}
                  role="tab"
                  type="button"
                  id={`skill-tab-${item.id}`}
                  aria-selected={active === i}
                  aria-controls="skill-detail"
                  tabIndex={active === i ? 0 : -1}
                  className="skills__tab"
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <Icon name={item.icon} />
                  <span>{item.short}</span>
                  <span className="skills__group">{item.group}</span>
                </button>
              ))}
            </div>

            <div id="skill-detail" role="tabpanel" aria-labelledby={`skill-tab-${d.id}`} className="skills__detail frame-gold" key={d.id}>
              <div className="skills__detail-head">
                <span className="skills__detail-icon shimmer" aria-hidden="true">
                  <Icon name={d.icon} />
                </span>
                <div>
                  <p className="skills__depth">
                    {level > 0 && (
                      <span className="skills__meter" aria-hidden="true">
                        {[1, 2, 3].map((n) => (
                          <span key={n} className={n <= level ? 'on' : undefined} />
                        ))}
                      </span>
                    )}
                    {d.depth}
                  </p>
                  <h3 className="skills__title">{d.title}</h3>
                </div>
              </div>
              <p className="skills__text">{d.text}</p>
              {d.evidence && (
                <p className="skills__evidence">
                  <Icon name="check" /> {d.evidence}
                </p>
              )}
              <ul className="skills__tools" role="list" aria-label="Tools and technologies">
                {d.tools.map((t) => (
                  <li key={t} className="tag">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
