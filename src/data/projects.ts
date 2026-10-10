/**
 * Project showcase data.
 *
 * `published: false` keeps an entry out of the production build entirely
 * (no card, no detail page, no sitemap entry). Company or client work stays
 * unpublished until public-disclosure approval is confirmed, and its detailed
 * write-up is kept OUTSIDE this public repository until then.
 *
 * Only add technologies, features and media that are verified.
 */

export type ProjectCategory = 'Mobile app' | 'Web platform' | '3D web' | 'Client website' | 'Industrial system';
export type ProjectStatus = 'Live' | 'MVP complete' | 'In development' | 'Draft';

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  status: ProjectStatus;
  published: boolean;
  /** Short line for cards. */
  summary: string;
  problem?: string;
  solution?: string;
  role?: string;
  technologies?: string[];
  features?: string[];
  statusNote?: string;
  /** Public URL, only when it is live and approved. */
  link?: { href: string; label: string };
  /** Monogram used for the typographic cover (no fake screenshots). */
  mark: string;
}

export const projects: Project[] = [
  {
    slug: 'spendly',
    title: 'Spendly',
    subtitle: 'Personal finance management app',
    category: 'Mobile app',
    status: 'MVP complete',
    published: true,
    mark: 'S',
    summary:
      'A mobile app for logging and understanding personal income and expenses, built on a secured Supabase backend.',
    problem:
      'Day-to-day spending is easy to lose track of. Most people only notice where their money went at the end of the month, when it is too late to change anything.',
    solution:
      'Spendly makes logging a transaction quick, keeps every record private to its owner, and turns the history into a clear dashboard of where money comes from and where it goes.',
    role:
      'Product definition, technical architecture, UI/UX specification and full-stack implementation, verified phase by phase on a real Android device and a live Supabase project.',
    technologies: [
      'React Native',
      'Expo',
      'Expo Router',
      'TypeScript (strict)',
      'Supabase (PostgreSQL, Auth, Edge Functions)',
      'Row Level Security',
      'TanStack Query',
      'Zod',
      'Reanimated',
      'Jest',
    ],
    features: [
      'Income and expense tracking with full create, edit and delete flows',
      'Analytics dashboard summarising spending',
      'Per-user data isolation enforced in the database with Row Level Security',
      'Profile and settings management',
      'Self-service account deletion handled by a Supabase Edge Function',
      'Automated test suite and a dedicated security review',
    ],
    statusNote:
      'The MVP is complete, including profile, settings and account deletion. Major flows have been verified on a physical Android device.',
  },
  {
    slug: 'route-plus',
    title: 'ROUTE+',
    subtitle: 'Travel planning website & app',
    category: 'Web platform',
    status: 'In development',
    published: true,
    mark: 'R+',
    summary:
      'Route-aware travel discovery for India: keep your main route, see the worthwhile stops along it, and decide each detour with the extra distance and time in front of you.',
    problem:
      'On a long road trip, the interesting places are often a short detour away, but travellers rarely know what each detour will cost them in kilometres and hours before they commit.',
    solution:
      'ROUTE+ treats the main route as the plan and every optional stop as an opportunity. Each suggestion shows the extra distance, extra time and visit duration, so the traveller can add or skip it with full information. Recommendations are rule-based and explainable.',
    role:
      'Product concept, product direction and development, including the web MVP and an Android companion wrapper.',
    technologies: [
      'Web MVP',
      'Google Maps Platform (Maps JavaScript, Routes, Places)',
      'Android (WebView / PWA companion)',
      'Provider-agnostic routing architecture',
    ],
    features: [
      'Solid main route with dashed, optional detours',
      'Extra distance, extra time and visit duration for every stop',
      'Add or skip decisions for each detour',
      'Data-driven design that works for any route, not a single demo trip',
    ],
    statusNote:
      'In active development. The roadmap moves from the web MVP to real routing and place data, then a production beta with accounts and a mobile companion.',
  },
  {
    slug: 'kalla-dhanush-portfolio',
    title: 'Kalla Dhanush',
    subtitle: 'Personal portfolio website',
    category: '3D web',
    status: 'Live',
    published: true,
    mark: 'D.',
    summary:
      'This website: a cinematic, static 3D portfolio with a real-time WebGL Earth, built to load fast and stay accessible.',
    problem:
      'A multidisciplinary profile — engineering, editing and photography — gets flattened by a standard résumé or template portfolio.',
    solution:
      'One connected world: a 3D intro and globe built with Three.js, editorial typography, and independent pages for every chapter, all generated as static HTML from a single set of typed content files.',
    role: 'Creative direction, design and front-end development.',
    technologies: [
      'Astro (static build)',
      'TypeScript',
      'Three.js / WebGL',
      'Custom GLSL shaders',
      'Natural Earth open map data',
      'GitHub Actions',
      'GitHub Pages',
    ],
    features: [
      'Real-time 3D Earth with golden illumination, city lights and orbital paths',
      'Skippable intro that remembers returning visitors and can be replayed',
      'Static routes for every page, so deep links work on refresh',
      'WebGL fallback, reduced-motion support and keyboard navigation',
      'Content publication flags that keep unapproved work out of the live site',
    ],
    statusNote: 'Live, and deployed automatically from GitHub with GitHub Actions and GitHub Pages.',
    link: { href: 'https://github.com/Dhanush7921/kalladhanush.in', label: 'View source on GitHub' },
  },

  // ---- Unpublished: awaiting public-disclosure approval ----
  // Detailed descriptions are intentionally not stored in this public repository.
  {
    slug: 'tierra-automation-website',
    title: 'Tierra Automation',
    subtitle: '3D corporate website',
    category: '3D web',
    status: 'Draft',
    published: false,
    mark: 'T',
    summary: 'Company website. Details withheld until public disclosure is approved.',
  },
  {
    slug: 'industrial-asset-qr-tracking',
    title: 'Industrial Asset & QR Tracking System',
    subtitle: 'Asset monitoring platform',
    category: 'Industrial system',
    status: 'Draft',
    published: false,
    mark: 'QR',
    summary: 'Details withheld until public disclosure is approved.',
  },
  {
    slug: 'ibc-portfolio',
    title: 'IBC',
    subtitle: 'Portfolio website',
    category: 'Client website',
    status: 'Draft',
    published: false,
    mark: 'IBC',
    summary: 'Client website. Details withheld until public disclosure is approved.',
  },
];

/** Drafts are only visible in local development when SHOW_DRAFTS=true. */
const showDrafts = import.meta.env.DEV && import.meta.env.SHOW_DRAFTS === 'true';

export const publishedProjects = projects.filter((p) => p.published || showDrafts);
export const projectCategories = [...new Set(publishedProjects.map((p) => p.category))];
export const getProject = (slug: string) => publishedProjects.find((p) => p.slug === slug);
