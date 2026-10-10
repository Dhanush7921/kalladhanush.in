/**
 * Skills grouped by discipline. No proficiency percentages by design.
 * `evidence` explains where the skill is demonstrated; `projects` links to
 * published project slugs only.
 */

export interface SkillGroup {
  id: string;
  name: string;
  intro: string;
  skills: string[];
  evidence: string;
  projects: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'ai-ml',
    name: 'AI & machine learning',
    intro: 'Specialising in AI & ML at ANITS, with hands-on classification and data-analysis work in Python.',
    skills: ['Python', 'pandas', 'scikit-learn', 'Random Forest classification', 'Streamlit', 'Jupyter notebooks', 'Exploratory data analysis'],
    evidence: 'Iris classifier served with Streamlit; sleep-health dataset analysis.',
    projects: [],
  },
  {
    id: 'web',
    name: 'Web development',
    intro: 'Static and full-stack web builds, from interactive 3D front ends to typed APIs.',
    skills: ['TypeScript', 'JavaScript', 'HTML & CSS', 'React', 'Astro', 'Three.js / WebGL', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'SQLite', 'Zod'],
    evidence: 'This portfolio; ROUTE+ web MVP.',
    projects: ['kalla-dhanush-portfolio', 'route-plus'],
  },
  {
    id: 'app',
    name: 'App development',
    intro: 'Production-minded mobile apps with secure backends and automated tests.',
    skills: ['React Native', 'Expo', 'Expo Router', 'Supabase', 'PostgreSQL', 'Row Level Security', 'Edge Functions', 'TanStack Query', 'Jest', 'Android Studio'],
    evidence: 'Spendly MVP; ROUTE+ Android companion wrapper.',
    projects: ['spendly', 'route-plus'],
  },
  {
    id: 'embedded',
    name: 'Embedded systems & electronics',
    intro: 'An EEE background applied to microcontrollers, sensors and motor control.',
    skills: ['ESP32', 'Arduino', 'Custom PCB bring-up', 'IR sensor arrays', 'RFID (RC522 over SPI)', 'Motor drivers', 'Bluetooth control', 'Circuits & electronics'],
    evidence: 'Polytechnic EEE studies; ESP32 robotics work.',
    projects: [],
  },
  {
    id: 'design',
    name: 'UI/UX & creative direction',
    intro: 'Deciding how a product should look and feel before it is built.',
    skills: ['UI/UX specification', 'Visual direction', 'Typography & layout', 'Social media ad creatives', 'Creative direction'],
    evidence: 'Spendly UI/UX specification; ROUTE+ visual direction; this site.',
    projects: ['spendly', 'route-plus', 'kalla-dhanush-portfolio'],
  },
  {
    id: 'visual',
    name: 'Photography & video',
    intro: 'Telling stories through light, framing and the edit.',
    skills: ['Photography', 'Portraits', 'Video editing', 'Colour & tone'],
    evidence: 'See My World.',
    projects: [],
  },
  {
    id: 'craft',
    name: 'Problem-solving',
    intro: 'Breaking big products into verified, shippable phases.',
    skills: ['Phase-based delivery', 'Architecture planning', 'Testing & verification', 'Security hardening', 'Git & GitHub Actions'],
    evidence: 'Spendly phase history; this site’s automated deployment.',
    projects: ['spendly', 'kalla-dhanush-portfolio'],
  },
];

export const allSkills = skillGroups.flatMap((g) => g.skills.map((s) => ({ skill: s, group: g.id })));
