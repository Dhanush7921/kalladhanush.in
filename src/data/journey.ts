/**
 * Journey timeline, oldest first. Every entry must be verifiable.
 * `when` is optional: academic years are deliberately omitted until confirmed.
 * Use `published: false` to keep an entry out of the live site.
 */

export type JourneyKind = 'Education' | 'Experience' | 'Project' | 'Practice';

export interface JourneyEntry {
  id: string;
  kind: JourneyKind;
  title: string;
  place: string;
  when?: string;
  result?: string;
  summary: string;
  details: string[];
  projectSlug?: string;
  published: boolean;
}

export const journey: JourneyEntry[] = [
  {
    id: 'school',
    kind: 'Education',
    title: 'Secondary schooling (CBSE)',
    place: "Dr. KKR's Gowtham School",
    result: '52%',
    summary: 'Completed schooling under the CBSE curriculum.',
    details: ['Board: Central Board of Secondary Education (CBSE).', 'Result: 52%.'],
    published: true,
  },
  {
    id: 'polytechnic',
    kind: 'Education',
    title: 'Electrical & Electronics Engineering (EEE)',
    place: 'Sai Ganapathi Polytechnic',
    result: '70.5%',
    summary: 'Polytechnic studies in electrical and electronics engineering — the hardware foundation behind later embedded work.',
    details: [
      'Branch: Electrical & Electronics Engineering.',
      'Result: 70.5%.',
      'Grounding in circuits and electronics that now feeds into embedded and robotics projects.',
    ],
    published: true,
  },
  {
    id: 'anits',
    kind: 'Education',
    title: 'Computer Science & Engineering (AI & ML)',
    place: 'ANITS — Anil Neerukonda Institute of Technology & Sciences',
    result: '6.6 CGPA',
    summary: 'Computer science with a specialisation in artificial intelligence and machine learning.',
    details: [
      'Specialisation: Artificial Intelligence & Machine Learning.',
      'Result: 6.6 CGPA (shown as awarded; no percentage conversion is implied).',
    ],
    published: true,
  },
  {
    id: 'ml-practice',
    kind: 'Practice',
    title: 'Machine-learning practice projects',
    place: 'Published on GitHub',
    when: '2024',
    summary: 'Hands-on classification and data-analysis work in Python.',
    details: [
      'An Iris flower classifier using a scikit-learn Random Forest, served as an interactive Streamlit app.',
      'Exploratory analysis of a sleep-health and lifestyle dataset in a Jupyter notebook with pandas.',
    ],
    published: true,
  },
  {
    id: 'spendly',
    kind: 'Project',
    title: 'Spendly reaches MVP',
    place: 'Personal project',
    summary: 'A React Native and Supabase finance app taken from product definition to a complete, tested MVP.',
    details: [
      'Built in phases: product definition, architecture, UI/UX specification, backend and auth, analytics, hardening, then profile, settings and account deletion.',
      'Verified on a physical Android device against a live Supabase project.',
    ],
    projectSlug: 'spendly',
    published: true,
  },
  {
    id: 'tierra',
    kind: 'Experience',
    title: 'Technology & Development Trainee (provisional)',
    place: 'Tierra Automation, Visakhapatnam',
    when: 'Since September 2026',
    summary: 'Joined a Visakhapatnam science, technology and engineering company.',
    details: [
      'Designation is provisional.',
      'Tierra Automation works across embedded systems, IoT, full-stack web development, app development and robotics.',
    ],
    published: true,
  },
  {
    id: 'route-plus',
    kind: 'Project',
    title: 'ROUTE+ enters production development',
    place: 'Product in development',
    summary: 'Route-aware travel discovery moves from a web MVP toward real routing and place data.',
    details: [
      'Main route stays the plan; optional detours show their extra distance and time.',
      'Google Maps Platform selected for routing and places, with an Android companion wrapper.',
    ],
    projectSlug: 'route-plus',
    published: true,
  },
];

export const publishedJourney = journey.filter((j) => j.published);
