/**
 * Image registry. Every photograph on the site is one of Dhanush's two supplied photos —
 * no generated or stock imagery of him is used anywhere.
 */
import heroAvif480 from '../assets/images/portrait-hero-480.avif';
import heroAvif720 from '../assets/images/portrait-hero-720.avif';
import heroAvif813 from '../assets/images/portrait-hero-813.avif';
import heroWebp480 from '../assets/images/portrait-hero-480.webp';
import heroWebp720 from '../assets/images/portrait-hero-720.webp';
import heroWebp813 from '../assets/images/portrait-hero-813.webp';
import travelAvif560 from '../assets/images/portrait-travel-560.avif';
import travelAvif900 from '../assets/images/portrait-travel-900.avif';
import travelAvif1280 from '../assets/images/portrait-travel-1280.avif';
import travelWebp560 from '../assets/images/portrait-travel-560.webp';
import travelWebp900 from '../assets/images/portrait-travel-900.webp';
import travelWebp1280 from '../assets/images/portrait-travel-1280.webp';
import pillarAvif560 from '../assets/images/portrait-pillar-560.avif';
import pillarAvif941 from '../assets/images/portrait-pillar-941.avif';
import pillarWebp560 from '../assets/images/portrait-pillar-560.webp';
import pillarWebp941 from '../assets/images/portrait-pillar-941.webp';
import kd160 from '../assets/images/kd-logo-160.webp';
import kd640 from '../assets/images/kd-logo-640.webp';
import landPoints from '../assets/land-points.bin';

export interface ResponsiveImage {
  avif: string;
  webp: string;
  fallback: string;
  width: number;
  height: number;
  alt: string;
}

const set = (pairs: [string, number][]) => pairs.map(([src, w]) => `${src} ${w}w`).join(', ');

/** Photo 1 — full-length editorial portrait beside a carved stone pillar (hero). */
export const heroPortrait: ResponsiveImage = {
  avif: set([
    [heroAvif480, 480],
    [heroAvif720, 720],
    [heroAvif813, 813],
  ]),
  webp: set([
    [heroWebp480, 480],
    [heroWebp720, 720],
    [heroWebp813, 813],
  ]),
  fallback: heroWebp720,
  width: 813,
  height: 1312,
  alt: 'Kalla Dhanush in an olive shirt and white trousers, leaning against a carved stone pillar, wearing sunglasses.',
};

/** Photo 2 — sunlit portrait in the hills (about / my world). */
export const travelPortrait: ResponsiveImage = {
  avif: set([
    [travelAvif560, 560],
    [travelAvif900, 900],
    [travelAvif1280, 1280],
  ]),
  webp: set([
    [travelWebp560, 560],
    [travelWebp900, 900],
    [travelWebp1280, 1280],
  ]),
  fallback: travelWebp900,
  width: 1280,
  height: 1600,
  alt: 'Kalla Dhanush smiling in a white shirt on a green hillside, with misty mountain ridges and a clear blue sky behind him.',
};

/** Photo 1, uncropped — used in the My World gallery and lightbox. */
export const pillarPortrait: ResponsiveImage = {
  avif: set([
    [pillarAvif560, 560],
    [pillarAvif941, 941],
  ]),
  webp: set([
    [pillarWebp560, 560],
    [pillarWebp941, 941],
  ]),
  fallback: pillarWebp941,
  width: 941,
  height: 1672,
  alt: 'Full-length portrait of Kalla Dhanush leaning on a carved stone pillar beneath a striped canopy.',
};

export const kdLogo = { small: kd160, large: kd640 };
export const landPointsUrl = landPoints;
