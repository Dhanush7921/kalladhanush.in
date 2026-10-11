import { useId, type ReactNode } from 'react';
import type { ArtKey } from '../content/portfolio';

/**
 * Decorative, abstract artwork for project cards — deliberately NOT product screenshots.
 * Each composition hints at the project's idea using the brand's gold-on-black language.
 */
export default function ProjectArt({ kind }: { kind: ArtKey }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  const common = (
    <>
      <radialGradient id={id('bg')} cx="70%" cy="40%" r="85%">
        <stop offset="0" stopColor="#2a1806" />
        <stop offset=".45" stopColor="#0e0b08" />
        <stop offset="1" stopColor="#070707" />
      </radialGradient>
      <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff0b8" />
        <stop offset=".4" stopColor="#ffc63a" />
        <stop offset="1" stopColor="#e07800" />
      </linearGradient>
      <linearGradient id={id('fadeV')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffcf5a" stopOpacity=".55" />
        <stop offset="1" stopColor="#ff8c00" stopOpacity="0" />
      </linearGradient>
      <pattern id={id('grid')} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="#ffbe5a" strokeOpacity=".06" strokeWidth=".6" />
      </pattern>
      <radialGradient id={id('vignette')} cx="50%" cy="50%" r="70%">
        <stop offset=".55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".65" />
      </radialGradient>
      <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </>
  );

  let art: ReactNode = null;

  switch (kind) {
    case 'spendly': {
      const C = 2 * Math.PI * 70;
      const segs = [
        [0.42, '#ffd24a'],
        [0.26, '#ff9a1a'],
        [0.18, '#b8650a'],
      ] as const;
      let offset = 0;
      art = (
        <>
          <g transform="translate(272 140) rotate(-90)">
            <circle r="70" fill="none" stroke="#ffbe5a" strokeOpacity=".08" strokeWidth="16" />
            {segs.map(([frac, color], i) => {
              const el = (
                <circle
                  key={i}
                  r="70"
                  fill="none"
                  stroke={color}
                  strokeWidth="16"
                  strokeDasharray={`${frac * C - 6} ${C}`}
                  strokeDashoffset={-offset * C}
                  opacity={0.9 - i * 0.15}
                />
              );
              offset += frac;
              return el;
            })}
            <circle r="48" fill="none" stroke="#ffbe5a" strokeOpacity=".22" strokeWidth=".8" />
          </g>
          <circle cx="272" cy="140" r="4" fill={url('gold')} filter={url('glow')} />
          <g>
            {[46, 72, 58, 98, 84, 120].map((h, i) => (
              <rect key={i} x={44 + i * 22} y={222 - h} width="12" height={h} rx="2" fill={url('fadeV')} />
            ))}
            <path d="M40 222.5h140" stroke="#ffbe5a" strokeOpacity=".3" />
            <polyline
              points="50,170 72,146 94,160 116,118 138,132 160,94"
              fill="none"
              stroke={url('gold')}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={url('glow')}
            />
            <circle cx="160" cy="94" r="3.5" fill="#fff2c2" />
          </g>
        </>
      );
      break;
    }
    case 'route': {
      art = (
        <>
          <g fill="none" stroke="#ffbe5a" strokeOpacity=".07">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M-10 ${70 + i * 34} C 90 ${40 + i * 30}, 180 ${110 + i * 26}, 260 ${70 + i * 32} S 380 ${60 + i * 30}, 420 ${80 + i * 30}`} />
            ))}
          </g>
          <path d="M150 168 C 150 110, 205 92, 222 70" fill="none" stroke="#ffcf5a" strokeOpacity=".7" strokeWidth="1.6" strokeDasharray="4 6" />
          <path d="M282 112 C 300 150, 340 160, 352 190" fill="none" stroke="#ffcf5a" strokeOpacity=".55" strokeWidth="1.6" strokeDasharray="4 6" />
          <path
            d="M34 236 C 110 226, 120 170, 182 152 S 280 120, 300 98 S 352 54, 372 46"
            fill="none"
            stroke={url('gold')}
            strokeWidth="3.2"
            strokeLinecap="round"
            filter={url('glow')}
          />
          {[
            [222, 70],
            [352, 190],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="11" fill="#ff8c00" fillOpacity=".12" stroke="#ffcf5a" strokeOpacity=".5" />
              <circle cx={x} cy={y} r="3.5" fill="#ffe7a3" />
            </g>
          ))}
          <circle cx="34" cy="236" r="6" fill="#0b0a09" stroke="#ffd24a" strokeWidth="2" />
          <circle cx="372" cy="46" r="7" fill="#ffd24a" filter={url('glow')} />
          <circle cx="372" cy="46" r="15" fill="none" stroke="#ffd24a" strokeOpacity=".35" />
        </>
      );
      break;
    }
    case 'layers': {
      const layer = (y: number, o: number, k: number) => (
        <g key={y} opacity={o}>
          <path d={`M200 ${y - 52} L300 ${y} L200 ${y + 52} L100 ${y} Z`} fill={url('fadeV')} fillOpacity={0.18 + k * 0.08} stroke={url('gold')} strokeWidth="1.2" />
          <path d={`M200 ${y - 30} L258 ${y} L200 ${y + 30} L142 ${y} Z`} fill="none" stroke="#ffcf5a" strokeOpacity=".35" strokeWidth=".8" />
        </g>
      );
      art = (
        <>
          <path d="M200 12V268" stroke={url('fadeV')} strokeWidth="1.2" />
          {layer(196, 0.45, 0)}
          {layer(152, 0.7, 1)}
          {layer(108, 1, 2)}
          <circle cx="200" cy="108" r="5" fill="#fff0b8" filter={url('glow')} />
          {[
            [86, 74, 10],
            [318, 210, 12],
            [330, 64, 7],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              d={`M${x} ${y - s} L${x + s} ${y - s / 2} L${x + s} ${y + s / 2} L${x} ${y + s} L${x - s} ${y + s / 2} L${x - s} ${y - s / 2} Z M${x} ${y - s} V${y} M${x} ${y} L${x + s} ${y - s / 2} M${x} ${y} L${x - s} ${y - s / 2}`}
              fill="none"
              stroke="#ffcf5a"
              strokeOpacity=".5"
              strokeWidth=".9"
            />
          ))}
        </>
      );
      break;
    }
    case 'grid': {
      const N = 13;
      const S = 10;
      const x0 = 135;
      const y0 = 75;
      const finder = (r: number, c: number) => r < 4 && c < 4 ? true : r < 4 && c > N - 5 ? true : r > N - 5 && c < 4;
      let seed = 7;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      const cells: ReactNode[] = [];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (finder(r, c)) continue;
          const v = rand();
          if (v > 0.52) cells.push(<rect key={`${r}-${c}`} x={x0 + c * S + 1} y={y0 + r * S + 1} width={S - 2} height={S - 2} rx="1.2" fill="#ffc63a" opacity={0.25 + v * 0.6} />);
        }
      }
      const fp = (x: number, y: number) => (
        <g key={`${x}-${y}`}>
          <rect x={x + 1} y={y + 1} width={S * 4 - 2} height={S * 4 - 2} rx="4" fill="none" stroke={url('gold')} strokeWidth="2.5" />
          <rect x={x + 11} y={y + 11} width={S * 2 - 2} height={S * 2 - 2} rx="2" fill={url('gold')} />
        </g>
      );
      art = (
        <>
          <g stroke="#ffcf5a" strokeOpacity=".35" strokeWidth=".9" fill="none">
            <path d="M135 140 H70 V92 H42" />
            <path d="M135 170 H88 V212 H46" />
            <path d="M265 110 H318 V70 H356" />
            <path d="M265 190 H332 V220 H360" />
          </g>
          {[
            [42, 92],
            [46, 212],
            [356, 70],
            [360, 220],
          ].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 9} y={y - 9} width="18" height="18" rx="4" fill="#0b0a09" stroke="#ffcf5a" strokeOpacity=".6" />
              <circle cx={x} cy={y} r="2.5" fill="#ffd24a" />
            </g>
          ))}
          <rect x={x0 - 10} y={y0 - 10} width={N * S + 20} height={N * S + 20} rx="10" fill="#0b0a09" stroke="#ffbe5a" strokeOpacity=".25" />
          {cells}
          {fp(x0, y0)}
          {fp(x0 + (N - 4) * S, y0)}
          {fp(x0, y0 + (N - 4) * S)}
          <rect className="art-scan" x={x0 - 18} y="139" width={N * S + 36} height="2" fill="#ffe7a3" filter={url('glow')} opacity=".85" />
        </>
      );
      break;
    }
    case 'portfolio': {
      art = (
        <>
          <circle cx="200" cy="140" r="96" fill="#ff8c00" fillOpacity=".05" />
          <circle cx="200" cy="140" r="72" fill="#0b0907" stroke="#ffbe5a" strokeOpacity=".4" />
          <g fill="none" stroke="#ffbe5a" strokeOpacity=".16">
            <ellipse cx="200" cy="140" rx="72" ry="24" />
            <ellipse cx="200" cy="140" rx="72" ry="50" />
            <ellipse cx="200" cy="140" rx="26" ry="72" />
            <ellipse cx="200" cy="140" rx="54" ry="72" />
          </g>
          <ellipse cx="200" cy="140" rx="160" ry="44" fill="none" stroke={url('gold')} strokeWidth="1.4" transform="rotate(-14 200 140)" />
          <ellipse cx="200" cy="140" rx="128" ry="30" fill="none" stroke="#ffcf5a" strokeOpacity=".4" transform="rotate(18 200 140)" />
          <circle cx="352" cy="102" r="5" fill="#fff0b8" filter={url('glow')} />
          <circle cx="82" cy="174" r="3.5" fill="#ffd24a" filter={url('glow')} />
          <path d="M184 116 V164 M218 116 L192 140 L220 164" fill="none" stroke={url('gold')} strokeWidth="5" strokeLinejoin="miter" filter={url('glow')} />
        </>
      );
      break;
    }
    case 'frames': {
      const frame = (x: number, y: number, o: number, front = false) => (
        <g key={x} opacity={o}>
          <rect x={x} y={y} width="210" height="140" rx="10" fill="#0c0b0a" stroke={front ? url('gold') : '#ffbe5a'} strokeOpacity={front ? 1 : 0.35} strokeWidth={front ? 1.4 : 1} />
          <path d={`M${x} ${y + 22}H${x + 210}`} stroke="#ffbe5a" strokeOpacity=".2" />
          {[0, 1, 2].map((d) => (
            <circle key={d} cx={x + 14 + d * 10} cy={y + 11} r="2.6" fill="#ffcf5a" opacity={0.6 - d * 0.15} />
          ))}
          {front && (
            <>
              <rect x={x + 18} y={y + 38} width="86" height="10" rx="2" fill="#ffd24a" opacity=".85" />
              <rect x={x + 18} y={y + 56} width="120" height="5" rx="2" fill="#ffbe5a" opacity=".35" />
              <rect x={x + 18} y={y + 67} width="96" height="5" rx="2" fill="#ffbe5a" opacity=".25" />
              <rect x={x + 18} y={y + 88} width="54" height="30" rx="4" fill="#ff8c00" fillOpacity=".18" stroke="#ffcf5a" strokeOpacity=".4" />
              <rect x={x + 80} y={y + 88} width="54" height="30" rx="4" fill="#ff8c00" fillOpacity=".12" stroke="#ffcf5a" strokeOpacity=".3" />
              <rect x={x + 142} y={y + 88} width="50" height="30" rx="4" fill="#ff8c00" fillOpacity=".08" stroke="#ffcf5a" strokeOpacity=".2" />
            </>
          )}
        </g>
      );
      art = (
        <>
          {frame(150, 36, 0.45)}
          {frame(118, 64, 0.7)}
          {frame(86, 94, 1, true)}
        </>
      );
      break;
    }
  }

  return (
    <svg className="project-art" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>{common}</defs>
      <rect width="400" height="280" fill={url('bg')} />
      <rect width="400" height="280" fill={url('grid')} />
      {art}
      <rect width="400" height="280" fill={url('vignette')} />
    </svg>
  );
}
