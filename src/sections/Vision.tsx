import { vision } from '../content/portfolio';
import { SectionHeading } from '../components/UI';
import Embers from '../components/Embers';
import { useReveal } from '../hooks/useMotion';
import './Vision.css';

// Orbital arc: cubic Bézier from (0,186) to (1000,186) with control points at (250,22) and (750,22).
const ARC = { p0: 186, p1: 22, height: 220 };
const arcY = (xFrac: number) => {
  // x(t) is symmetric for these control points; solve t by bisection.
  const bx = (t: number) => 3 * (1 - t) ** 2 * t * 250 + 3 * (1 - t) * t ** 2 * 750 + t ** 3 * 1000;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < xFrac * 1000) lo = mid;
    else hi = mid;
  }
  const t = (lo + hi) / 2;
  return (1 - t) ** 3 * ARC.p0 + 3 * (1 - t) ** 2 * t * ARC.p1 + 3 * (1 - t) * t ** 2 * ARC.p1 + t ** 3 * ARC.p0;
};

export default function Vision() {
  const ref = useReveal<HTMLElement>();
  const n = vision.length;
  return (
    <section id="vision" ref={ref} className="section vision" aria-labelledby="vision-title">
      <Embers />
      <div className="container">
        <SectionHeading
          index="07"
          label="Vision & Future"
          id="vision-title"
          title={['Built for What Comes', { em: 'Next' }]}
          lead="Ambitions, not credentials — the direction I am building toward, one deliberate step at a time."
          center
        />

        <div className="roadmap" data-reveal="fade">
          <svg className="roadmap__svg" viewBox={`0 0 1000 ${ARC.height}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="roadmap-g" x1="0" x2="1">
                <stop offset="0" stopColor="#7a4100" />
                <stop offset=".35" stopColor="#ffd700" />
                <stop offset=".7" stopColor="#ff8c00" />
                <stop offset="1" stopColor="#7a4100" />
              </linearGradient>
            </defs>
            <path className="roadmap__ghost" d={`M0 ${ARC.p0 + 26} C 250 ${ARC.p1 + 40}, 750 ${ARC.p1 + 40}, 1000 ${ARC.p0 + 26}`} vectorEffect="non-scaling-stroke" />
            <path className="roadmap__ghost" d={`M0 ${ARC.p0 - 30} C 250 ${ARC.p1 - 26}, 750 ${ARC.p1 - 26}, 1000 ${ARC.p0 - 30}`} vectorEffect="non-scaling-stroke" />
            <path
              className="roadmap__line"
              d={`M0 ${ARC.p0} C 250 ${ARC.p1}, 750 ${ARC.p1}, 1000 ${ARC.p0}`}
              pathLength={1}
              stroke="url(#roadmap-g)"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="roadmap__list" role="list">
            {vision.map((v, i) => {
              const xFrac = (i + 0.5) / n;
              const y = (arcY(xFrac) / ARC.height) * 100;
              return (
                <li key={v.title} className="roadmap__item" style={{ ['--y' as string]: y.toFixed(2), ['--i' as string]: i }}>
                  <span className="roadmap__node" aria-hidden="true" />
                  <div className="roadmap__card">
                    <p className="roadmap__horizon">
                      <span>{String(i + 1).padStart(2, '0')}</span> {v.horizon}
                    </p>
                    <h3 className="roadmap__title">{v.title}</h3>
                    <p className="roadmap__text">{v.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
