/**
 * Vision & roadmap. Everything here is a GOAL unless `kind` is 'In progress'.
 * The page labels goals clearly so they are never read as achievements.
 * Add personal goals here only in Dhanush's own words.
 */

export interface VisionItem {
  title: string;
  body: string;
}

export interface VisionHorizon {
  id: string;
  name: string;
  kind: 'In progress' | 'Goal' | 'Aspiration';
  items: VisionItem[];
}

export const visionStatement =
  'To build technology that solves real problems and to tell its story with the eye of a filmmaker — bringing engineering, design and visual storytelling under one roof.';

export const horizons: VisionHorizon[] = [
  {
    id: 'now',
    name: 'Now',
    kind: 'In progress',
    items: [
      { title: 'Grow at Tierra Automation', body: 'Learning and contributing as a Technology & Development Trainee (provisional) across embedded, IoT, web, app and robotics work.' },
      { title: 'Take ROUTE+ toward production', body: 'Real routing, real place data and a detour engine that explains every suggestion.' },
      { title: 'Keep Spendly sharp', body: 'Maintain a tested, secure MVP and keep improving how it explains everyday spending.' },
    ],
  },
  {
    id: 'next',
    name: 'Next',
    kind: 'Goal',
    items: [
      { title: 'A ROUTE+ production beta', body: 'Accounts, a mobile companion with GPS, and a database built for geography.' },
    ],
  },
  {
    id: 'long-term',
    name: 'Long term',
    kind: 'Aspiration',
    items: [
      { title: 'Build and lead a technology venture', body: 'A company that ships useful products and treats design and storytelling as seriously as engineering.' },
    ],
  },
];
