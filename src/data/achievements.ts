/**
 * Certificates and achievements. Add ONLY verified items.
 *
 * To add a certificate:
 *   1. Put an image of it in src/assets/certificates/ (e.g. aws-cloud.jpg).
 *   2. Import it below and add an entry with published: true.
 *
 * import awsCloud from '../assets/certificates/aws-cloud.jpg';
 * { id: 'aws-cloud', title: '...', issuer: '...', date: '2026-01', image: awsCloud, published: true }
 */
import type { ImageMetadata } from 'astro';

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  /** As printed on the certificate, e.g. 'March 2026'. Leave empty if unknown. */
  date?: string;
  description?: string;
  image?: ImageMetadata;
  /** Public verification URL, if the issuer provides one. */
  verifyUrl?: string;
  published: boolean;
}

export const achievements: Achievement[] = [];

export const publishedAchievements = achievements.filter((a) => a.published);
