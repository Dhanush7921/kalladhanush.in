import type { APIRoute } from 'astro';
import { site, contact } from '../data/site';
import { url } from '../lib/url';

/** Static vCard so visitors can save Dhanush's contact in one tap. */
export const GET: APIRoute = ({ site: siteUrl }) => {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Dhanush;Kalla;;;',
    `FN:${site.name}`,
    `NICKNAME:${site.knownAs}`,
    `TITLE:${site.title}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    `TEL;TYPE=CELL:+${contact.whatsappNumber}`,
    `URL:${new URL(url('/'), siteUrl).href}`,
    `ADR;TYPE=HOME:;;;${site.location.city};;;${site.location.country}`,
    `X-SOCIALPROFILE;TYPE=instagram:${contact.instagram}`,
    'END:VCARD',
  ];
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  });
};
