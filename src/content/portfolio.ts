/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — the single source of truth for everything the site says.
 *
 *  Rule: publish only verified facts. When something is unknown, leave it empty
 *  and the UI hides it — never fill gaps with guesses.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { IconName } from '../components/Icon';

export const site = {
  name: 'Kalla Dhanush',
  nameUpper: 'KALLA DHANUSH',
  domain: 'kalladhanush.in',
  url: 'https://kalladhanush.in/',
  tagline: 'Beyond Vision. Into Reality.',
  roles: ['AI & ML Engineer', 'Video Editor', 'Photographer'],
  support: 'Engineer. Innovator. Creator.',
  intro:
    'I bring engineering, technology, and creativity together to transform ambitious ideas into meaningful digital experiences.',
  location: 'Visakhapatnam, India',
  sourceRepo: 'https://github.com/Dhanush7921/kalladhanush.in',
};

/**
 * Contact destinations. Empty strings are hidden automatically.
 * NOTE: email / GitHub / Instagram are carried over from the previous live site — confirm before launch.
 */
export const contact = {
  email: 'laxmishankar558@gmail.com',
  github: { url: 'https://github.com/Dhanush7921', handle: 'Dhanush7921' },
  instagram: { url: 'https://www.instagram.com/_.d.e.v.a.7.9._/', handle: '@_.d.e.v.a.7.9._' },
  linkedin: { url: '', handle: '' },
};

/** Verified contact channels, in display order (empty destinations are skipped). */
export const channels = (
  [
    contact.email && { icon: 'mail', label: 'Email', value: contact.email, href: `mailto:${contact.email}`, external: false },
    contact.github.url && { icon: 'code', label: 'GitHub', value: contact.github.handle, href: contact.github.url, external: true },
    contact.instagram.url && { icon: 'aperture', label: 'Instagram', value: contact.instagram.handle, href: contact.instagram.url, external: true },
    contact.linkedin.url && { icon: 'briefcase', label: 'LinkedIn', value: contact.linkedin.handle, href: contact.linkedin.url, external: true },
  ] as const
).filter(Boolean) as { icon: IconName; label: string; value: string; href: string; external: boolean }[];

export const nav = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'world', label: 'My World' },
  { id: 'vision', label: 'Vision' },
  { id: 'contact', label: 'Contact' },
] as const;

/* ───────────────────────── About ───────────────────────── */

export const about = {
  intro:
    "I'm Kalla Dhanush, a Computer Science and Engineering graduate specializing in Artificial Intelligence and Machine Learning, with a strong interest in development, engineering, and visual storytelling. I enjoy turning ideas into digital products, exploring innovative technologies, and expressing creativity through photography and video.",
  traits: [
    { icon: 'gear', title: 'Engineering mindset', text: 'Systems first — understand how it works, then make it work well.' },
    { icon: 'bulb', title: 'Creative thinking', text: 'A photographer’s eye for framing, light and story.' },
    { icon: 'target', title: 'Problem solving', text: 'Break the hard thing down until the next step is obvious.' },
    { icon: 'orbit', title: 'Curiosity & learning', text: 'From circuits to code to cameras — always learning the next layer.' },
    { icon: 'cube', title: 'Builder’s ambition', text: 'Turning ideas into practical products people can actually use.' },
  ] satisfies { icon: IconName; title: string; text: string }[],
};

export interface JourneyEntry {
  kind: 'Education' | 'Experience';
  title: string;
  place: string;
  /** Leave empty when the date is not confirmed. */
  when?: string;
  text: string;
  current?: boolean;
}

export const journey: JourneyEntry[] = [
  {
    kind: 'Education',
    title: 'Diploma in Electrical & Electronics Engineering',
    place: 'Sai Ganapathi Polytechnic',
    text: 'The hardware foundation — circuits, electronics and how real systems behave.',
  },
  {
    kind: 'Education',
    title: 'B.Tech in Computer Science & Engineering (AI & ML)',
    place: 'ANITS',
    text: 'Software, data and intelligent systems — specialising in artificial intelligence and machine learning.',
  },
];

/* ───────────────────────── Projects ───────────────────────── */

export type ProjectCategory = 'Apps' | 'Web' | '3D & Interactive' | 'Industrial';
export const projectCategories: ProjectCategory[] = ['Apps', 'Web', '3D & Interactive', 'Industrial'];

export type ArtKey = 'spendly' | 'route' | 'layers' | 'grid' | 'portfolio' | 'frames';

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  summary: string;
  categories: ProjectCategory[];
  art: ArtKey;
  status: string;
  /**
   * public       — full case study shown
   * confidential — identity shown, details withheld (company / client work awaiting permission)
   */
  visibility: 'public' | 'confidential';
  problem?: string;
  approach?: string;
  role?: string;
  outcome?: string;
  stack?: string[];
  links?: { label: string; href: string }[];
}

export const projects: Project[] = [
  {
    id: 'spendly',
    index: '01',
    title: 'Spendly',
    subtitle: 'Personal Finance App',
    summary: 'A mobile app for recording and understanding personal income and spending, on a secured Supabase backend.',
    categories: ['Apps'],
    art: 'spendly',
    status: 'MVP complete',
    visibility: 'public',
    problem:
      'Everyday spending is easy to lose track of — most people only see where their money went at the end of the month, when it is too late to change anything.',
    approach:
      'A React Native app that makes logging a transaction quick, keeps every record private to its owner with database-level Row Level Security, and turns the history into a clear analytics dashboard.',
    role: 'Product definition, technical architecture, UI/UX specification and implementation — verified phase by phase on a real Android device against a live Supabase project.',
    outcome:
      'MVP complete: authentication, full transaction flows, analytics dashboard, profile and settings, and self-service account deletion through a Supabase Edge Function — backed by an automated Jest test suite and a dedicated security review.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL + RLS', 'Edge Functions', 'TanStack Query', 'Zod', 'Reanimated', 'Jest'],
  },
  {
    id: 'route-plus',
    index: '02',
    title: 'ROUTE+',
    subtitle: 'Intelligent Travel Planning',
    summary:
      'Route-aware travel discovery for India: keep the main route, explore the stops along it, and decide every detour knowing its real cost.',
    categories: ['Web', 'Apps'],
    art: 'route',
    status: 'In development',
    visibility: 'public',
    problem:
      'On long road trips the most interesting places are often a short detour away — but travellers rarely know what each detour will cost in kilometres and hours before committing.',
    approach:
      'The main route is the plan; every optional stop is an opportunity. Each suggestion shows extra distance, extra time and visit duration so the traveller can add or skip it with full information. Recommendations are rule-based and explainable.',
    role: 'Product concept, direction and development — the web platform and an Android companion app.',
    outcome:
      'Web MVP built on a data-driven architecture that works for any route; real routing and place data are being integrated behind provider-agnostic interfaces.',
    stack: ['Web platform', 'Android companion (WebView / PWA)', 'Google Maps Platform — integration in progress'],
  },
  {
    id: 'portfolio',
    index: '03',
    title: 'Kalla Dhanush',
    subtitle: 'Personal Portfolio Website',
    summary: 'My personal brand as an interactive experience — the site you are exploring right now.',
    categories: ['Web', '3D & Interactive'],
    art: 'portfolio',
    status: 'You are here',
    visibility: 'public',
    problem:
      'A conventional résumé template could not show the range — engineering, product work, photography and video — or the standard of craft I hold myself to.',
    approach:
      'A bespoke black-and-gold identity built around my KD monogram, with one optimised WebGL scene, restrained motion, honest content and full keyboard, touch and reduced-motion support.',
    role: 'Creative direction, design and front-end development.',
    outcome: 'A fast static site with no backend, deployed automatically from GitHub with GitHub Actions and GitHub Pages.',
    stack: ['React', 'TypeScript', 'Vite', 'Three.js', 'CSS', 'GitHub Actions', 'GitHub Pages'],
    links: [{ label: 'View source on GitHub', href: 'https://github.com/Dhanush7921/kalladhanush.in' }],
  },
];

/* ───────────────────────── Skills ───────────────────────── */

export type Depth = 'Applied in projects' | 'Hands-on practice' | 'Academic focus' | 'Creative practice' | 'Mindset';

export interface Discipline {
  id: string;
  icon: IconName;
  title: string;
  short: string;
  group: 'Technology' | 'Creativity';
  depth: Depth;
  text: string;
  tools: string[];
  evidence?: string;
}

/** Depth labels describe how each skill is used — deliberately not self-rated percentages. */
export const disciplines: Discipline[] = [
  {
    id: 'ai',
    icon: 'ai',
    title: 'Artificial Intelligence & Machine Learning',
    short: 'AI & ML',
    group: 'Technology',
    depth: 'Academic focus',
    text: 'My degree specialisation — data, models and intelligent systems, and where they genuinely help real products.',
    tools: ['Python', 'Machine learning foundations'],
    evidence: 'B.Tech CSE (AI & ML) at ANITS',
  },
  {
    id: 'web',
    icon: 'web',
    title: 'Full-Stack Web Development',
    short: 'Full-Stack Web',
    group: 'Technology',
    depth: 'Applied in projects',
    text: 'Interfaces, APIs and data — from responsive front ends to the services and databases behind them.',
    tools: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Node.js', 'Express', 'SQL', 'SQLite', 'Git'],
    evidence: 'ROUTE+ web platform · this portfolio',
  },
  {
    id: 'app',
    icon: 'app',
    title: 'Application Development',
    short: 'App Development',
    group: 'Technology',
    depth: 'Applied in projects',
    text: 'Mobile products with real authentication, secure data and tested flows on physical devices.',
    tools: ['React Native', 'Expo', 'TypeScript', 'Supabase'],
    evidence: 'Spendly MVP · ROUTE+ Android companion',
  },
  {
    id: 'embedded',
    icon: 'chip',
    title: 'Embedded Systems & IoT',
    short: 'Embedded & IoT',
    group: 'Technology',
    depth: 'Hands-on practice',
    text: 'Microcontrollers, sensors and connected hardware — grounded in my electrical & electronics diploma.',
    tools: ['ESP32', 'Arduino', 'Electronics fundamentals'],
    evidence: 'Diploma in EEE · ESP32 prototyping',
  },
  {
    id: 'photo',
    icon: 'camera',
    title: 'Photography',
    short: 'Photography',
    group: 'Creativity',
    depth: 'Creative practice',
    text: 'Composition, light and mood — capturing people and places with a cinematic eye.',
    tools: ['Lightroom', 'Photoshop'],
  },
  {
    id: 'video',
    icon: 'film',
    title: 'Videography & Video Editing',
    short: 'Video Editing',
    group: 'Creativity',
    depth: 'Creative practice',
    text: 'Pacing, colour and sound — shaping footage into stories that hold attention.',
    tools: ['Premiere Pro'],
  },
  {
    id: 'design',
    icon: 'pen',
    title: 'Design & Creative Direction',
    short: 'Design & Direction',
    group: 'Creativity',
    depth: 'Creative practice',
    text: 'Brand identity, layout and visual systems — including the KD identity behind this site.',
    tools: ['Photoshop', 'Brand & visual identity'],
  },
  {
    id: 'problem',
    icon: 'target',
    title: 'Problem Solving',
    short: 'Problem Solving',
    group: 'Creativity',
    depth: 'Mindset',
    text: 'The thread that connects everything else: define the real problem, then design the simplest thing that solves it.',
    tools: ['Systems thinking', 'Debugging', 'Iteration'],
  },
];

/* ───────────────────────── Experience & learning ───────────────────────── */

export interface ExperienceEntry {
  type: 'Experience' | 'Internship' | 'Training';
  org: string;
  title: string;
  when?: string;
  text: string;
  current?: boolean;
}

/** Shown without dates until verified. Certificates appear only when real copies are supplied. */
export const experience: ExperienceEntry[] = [
  {
    type: 'Training',
    org: 'Infosys',
    title: 'Machine Learning Training',
    text: 'Training in machine-learning concepts and their practical application.',
  },
  {
    type: 'Internship',
    org: 'iStudio',
    title: 'UI/UX Internship',
    text: 'Internship in user-interface and user-experience design.',
  },
  {
    type: 'Training',
    org: 'EduMoon',
    title: 'Unity Game Development',
    text: 'Training in game development with the Unity engine.',
  },
];

export interface Certificate {
  title: string;
  issuer: string;
  date?: string;
  image: string;
  verifyUrl?: string;
}
/** Add verified certificates here (image imported from src/assets). Empty = future-content state. */
export const certificates: Certificate[] = [];

/* ───────────────────────── My World ───────────────────────── */

export type WorldTheme = 'Photography' | 'Film' | 'Motorcycles' | 'Travel' | 'Lifestyle' | 'Experiments';

export interface WorldTile {
  theme: WorldTheme;
  icon: IconName;
  title: string;
  text: string;
  /** 'travel' | 'pillar' — real photos only. Tiles without media render as editorial panels. */
  photo?: 'travel' | 'pillar';
}

export const worldTiles: WorldTile[] = [
  { theme: 'Travel', icon: 'mountain', title: 'Above the clouds', text: 'Roads that climb, horizons that open up, and the quiet up there.', photo: 'travel' },
  { theme: 'Photography', icon: 'camera', title: 'Seeing in frames', text: 'Light, shadow and the half-second when a moment becomes a photograph.' },
  { theme: 'Film', icon: 'film', title: 'Stories in motion', text: 'Cutting footage into rhythm — pacing, colour and sound working together.' },
  { theme: 'Lifestyle', icon: 'pulse', title: 'Discipline & style', text: 'Fitness, presence and showing up with intent — on and off camera.', photo: 'pillar' },
  { theme: 'Motorcycles', icon: 'bike', title: 'Two wheels, open road', text: 'Machines, engineering and the freedom of the ride.' },
  { theme: 'Experiments', icon: 'flask', title: 'Creative experiments', text: 'Ideas tried just to see what happens — where most good things begin.' },
];

/* ───────────────────────── Vision ───────────────────────── */

export const vision = [
  { horizon: 'Now', title: 'Engineer & builder', text: 'Becoming a stronger technology engineer — building every day, shipping real things.' },
  { horizon: 'Next', title: 'Useful products', text: 'Creating web and mobile products that solve everyday problems well.' },
  { horizon: 'Deeper', title: 'AI, ML & embedded', text: 'Expanding AI/ML and embedded engineering skills where software meets hardware.' },
  { horizon: 'Distinct', title: 'Creative identity', text: 'Growing a recognisable visual voice across photography, film and design.' },
  { horizon: 'North star', title: 'Future ventures', text: 'Building impactful technology ventures of my own — the long-term ambition.' },
];

/* ───────────────────────── Journal ───────────────────────── */

export interface JournalEntry {
  title: string;
  date: string;
  summary: string;
  href: string;
}
/** Add real articles here — the section switches from "coming soon" to a list automatically. */
export const journal: JournalEntry[] = [];

/* ───────────────────────── Contact ───────────────────────── */

export const enquiries = [
  { id: 'opportunity', label: 'Professional opportunity', subject: 'Professional opportunity' },
  { id: 'collab', label: 'Collaboration', subject: 'Collaboration idea' },
  { id: 'build', label: 'Web / app project', subject: 'Web or app project enquiry' },
  { id: 'creative', label: 'Creative production', subject: 'Creative production enquiry' },
  { id: 'photo', label: 'Photo & video', subject: 'Photography / videography enquiry' },
] as const;

export const mailto = (subject: string, body?: string) => {
  const params = new URLSearchParams({ subject });
  if (body) params.set('body', body);
  return `mailto:${contact.email}?${params.toString().replace(/\+/g, '%20')}`;
};
