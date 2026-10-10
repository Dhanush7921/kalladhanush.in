/**
 * Central identity, contact and navigation data.
 * Edit this file to change what the whole site says about Dhanush.
 * Rule: only verified facts. Leave something out rather than guess.
 */

export const site = {
  name: 'Kalla Dhanush',
  nameUpper: 'KALLA DHANUSH',
  knownAs: 'Deva',
  monogram: 'D.',
  brand: 'D. | KALLA DHANUSH',
  domain: 'kalladhanush.in',
  url: 'https://kalladhanush.in',
  title: 'AI & ML Engineer | Video Editor | Photographer',
  roles: ['AI & ML Engineer', 'Video Editor', 'Photographer'],
  otherExpertise: [
    'Full-Stack Web Developer',
    'App Developer',
    'Innovator',
    'Technology Enthusiast',
  ],
  identity: 'The multidisciplinary creator',
  tagline: 'Beyond Vision. Into Reality.',
  philosophy: ['Dream beyond limits.', 'Build with purpose.', 'Lead with vision.'],
  location: { city: 'Visakhapatnam', country: 'India', lat: 17.6868, lon: 83.2185 },
  description:
    'Kalla Dhanush (Deva) — AI & ML engineer, video editor and photographer from Visakhapatnam, India. Mobile apps, web platforms, interactive 3D and visual storytelling.',
} as const;

export const contact = {
  email: 'laxmishankar558@gmail.com',
  whatsappDisplay: '+91 92814 95472',
  whatsappNumber: '919281495472',
  instagram: 'https://www.instagram.com/_.d.e.v.a.7.9._/',
  instagramHandle: '@_.d.e.v.a.7.9._',
  // Verified as Dhanush's own authenticated GitHub account.
  github: 'https://github.com/Dhanush7921',
  githubHandle: 'Dhanush7921',
  // Add a LinkedIn URL here only once it is confirmed. Empty = hidden.
  linkedin: '',
  // Set to a path in /public (e.g. '/kalla-dhanush-resume.pdf') once the corrected resume is supplied.
  resume: '',
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${contact.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mailtoLink = (subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const q = params.toString().replace(/\+/g, '%20');
  return `mailto:${contact.email}${q ? `?${q}` : ''}`;
};

export interface NavItem {
  href: string;
  label: string;
  primary?: boolean;
}

export const nav: NavItem[] = [
  { href: '/about/', label: 'About', primary: true },
  { href: '/journey/', label: 'Journey', primary: true },
  { href: '/projects/', label: 'Projects', primary: true },
  { href: '/skills/', label: 'Skills', primary: true },
  { href: '/achievements/', label: 'Achievements' },
  { href: '/world/', label: 'My World', primary: true },
  { href: '/vision/', label: 'Vision', primary: true },
  { href: '/journal/', label: "Creator's Journal" },
  { href: '/contact/', label: 'Connect', primary: true },
];
