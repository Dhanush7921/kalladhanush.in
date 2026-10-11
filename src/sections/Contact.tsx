import { useEffect, useRef, useState } from 'react';
import { channels, contact, enquiries, mailto, site } from '../content/portfolio';
import { Button, KDMark, SectionHeading } from '../components/UI';
import Icon from '../components/Icon';
import Embers from '../components/Embers';
import { useReveal, useTilt } from '../hooks/useMotion';
import './Contact.css';

function downloadVCard() {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Kalla;Dhanush;;;',
    `FN:${site.name}`,
    `TITLE:${site.roles.join(' | ')}`,
    contact.email && `EMAIL;TYPE=INTERNET:${contact.email}`,
    `URL:${site.url}`,
    contact.github.url && `X-SOCIALPROFILE;TYPE=github:${contact.github.url}`,
    contact.instagram.url && `X-SOCIALPROFILE;TYPE=instagram:${contact.instagram.url}`,
    contact.linkedin.url && `X-SOCIALPROFILE;TYPE=linkedin:${contact.linkedin.url}`,
    'ADR;TYPE=HOME:;;;Visakhapatnam;;;India',
    'END:VCARD',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kalla-dhanush.vcf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function BusinessCard() {
  const [flipped, setFlipped] = useState(false);
  const tilt = useTilt<HTMLDivElement>(9);
  return (
    <div className="bcard-wrap" data-reveal="scale">
      <div ref={tilt} className="bcard-tilt">
        <div className={`bcard${flipped ? ' is-flipped' : ''}`}>
          <div className="bcard__face bcard__front" inert={flipped}>
            <span className="bcard__lines" aria-hidden="true" />
            <KDMark size={68} className="bcard__logo" decorative />
            <div className="bcard__id">
              <p className="bcard__name">{site.nameUpper}</p>
              <p className="bcard__roles">{site.roles.join(' · ')}</p>
            </div>
            <p className="bcard__tagline">{site.tagline}</p>
            <p className="bcard__domain">
              <Icon name="globe" /> {site.domain}
            </p>
          </div>
          <div className="bcard__face bcard__back" inert={!flipped}>
            <p className="bcard__back-title">Kalla Dhanush</p>
            <ul role="list" className="bcard__list">
              {channels.map((c) => (
                <li key={c.label}>
                  <Icon name={c.icon} />
                  <span>{c.value}</span>
                </li>
              ))}
              <li>
                <Icon name="mapPin" />
                <span>{site.location}</span>
              </li>
            </ul>
            <KDMark size={40} className="bcard__back-logo" decorative />
          </div>
        </div>
      </div>
      <div className="bcard__controls">
        <button type="button" className="btn btn--ghost btn--sm" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}>
          <Icon name="flip" />
          <span>{flipped ? 'Show front' : 'Flip card'}</span>
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={downloadVCard}>
          <Icon name="download" />
          <span>Save contact</span>
        </button>
      </div>
    </div>
  );
}

export default function Contact() {
  const ref = useReveal<HTMLElement>();
  const [intent, setIntent] = useState<(typeof enquiries)[number]['id']>(enquiries[0].id);
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const current = enquiries.find((e) => e.id === intent) ?? enquiries[0];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = contact.email;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="contact" ref={ref} className="section contact" aria-labelledby="contact-title">
      <Embers density={0.8} />
      <span className="contact__halo" aria-hidden="true" />
      <div className="container contact__grid">
        <div className="contact__main">
          <SectionHeading
            index="09"
            label="Let's Connect"
            id="contact-title"
            title={["Let's Build Something", { em: 'Remarkable' }]}
            lead="Open to professional opportunities, collaborations, web and app projects, creative production, and photography or videography work."
          />

          {contact.email && (
            <div className="contact__compose" data-reveal style={{ ['--delay' as string]: 120 }}>
              <p className="contact__q" id="intent-label">
                What would you like to talk about?
              </p>
              <div className="chip-row" role="group" aria-labelledby="intent-label">
                {enquiries.map((e) => (
                  <button key={e.id} type="button" className="chip" aria-pressed={intent === e.id} onClick={() => setIntent(e.id)}>
                    {e.label}
                  </button>
                ))}
              </div>
              <div className="contact__actions">
                <Button href={mailto(current.subject, `Hi Dhanush,\n\n`)} icon="mail">
                  Start the conversation
                </Button>
                <button type="button" className="contact__copy" onClick={copy}>
                  <Icon name={copied ? 'check' : 'copy'} />
                  <span>{copied ? 'Copied to clipboard' : contact.email}</span>
                  <span className="visually-hidden">{copied ? '' : ' — copy email address'}</span>
                </button>
              </div>
              <p className="contact__hint">Opens your email app with the subject “{current.subject}” filled in. No forms, no tracking.</p>
              <p className="visually-hidden" aria-live="polite">
                {copied ? 'Email address copied to clipboard' : ''}
              </p>
            </div>
          )}

          <ul className="contact__channels" role="list" data-reveal style={{ ['--delay' as string]: 220 }}>
            {channels.map((c) => (
              <li key={c.label}>
                <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className="contact__ch-icon">
                    <Icon name={c.icon} />
                  </span>
                  <span className="contact__ch-label">{c.label}</span>
                  <span className="contact__ch-value">{c.value}</span>
                  <Icon name="arrowUpRight" className="contact__ch-arrow" />
                  {c.external && <span className="visually-hidden"> (opens in a new tab)</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <BusinessCard />
      </div>
    </section>
  );
}
