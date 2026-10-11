import { Fragment, type MouseEventHandler, type ReactNode } from 'react';
import Icon, { type IconName } from './Icon';
import { useMagnetic } from '../hooks/useMotion';
import { kdLogo, type ResponsiveImage } from '../content/assets';

/* ───────────────────────── Button (magnetic link) ───────────────────────── */

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'gold' | 'ghost';
  size?: 'md' | 'sm';
  icon?: IconName;
  external?: boolean;
  download?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function Button({ href, children, variant = 'gold', size = 'md', icon, external, download, className, onClick }: ButtonProps) {
  const ref = useMagnetic<HTMLAnchorElement>();
  const cls = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', className].filter(Boolean).join(' ');
  return (
    <a
      ref={ref}
      href={href}
      className={cls}
      onClick={onClick}
      download={download}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span>{children}</span>
      {icon && <Icon name={icon} />}
      {external && <span className="visually-hidden"> (opens in a new tab)</span>}
    </a>
  );
}

/* ───────────────────────── Section heading with word reveal ───────────────────────── */

export type TitlePart = string | { em: string };

export function RevealTitle({ parts, as: Tag = 'h2', id, className = 'display-title' }: { parts: TitlePart[]; as?: 'h1' | 'h2' | 'h3'; id?: string; className?: string }) {
  let i = 0;
  return (
    <Tag id={id} className={`${className} reveal-words`}>
      {parts.map((part, pi) => {
        const text = typeof part === 'string' ? part : part.em;
        const words = text.split(' ').filter(Boolean);
        const content = words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="w">
              <span style={{ ['--i' as string]: i++ }}>{w}</span>
            </span>{' '}
          </Fragment>
        ));
        return typeof part === 'string' ? <Fragment key={pi}>{content}</Fragment> : <em key={pi}>{content}</em>;
      })}
    </Tag>
  );
}

interface SectionHeadingProps {
  index: string;
  label: string;
  title: TitlePart[];
  id: string;
  lead?: ReactNode;
  center?: boolean;
}

export function SectionHeading({ index, label, title, id, lead, center }: SectionHeadingProps) {
  return (
    <header className={`section-head${center ? ' section-head--center' : ''}`}>
      <p className="eyebrow" data-reveal>
        <span className="eyebrow__index">{index}</span>
        <span className="eyebrow__line" aria-hidden="true" />
        {label}
      </p>
      <RevealTitle parts={title} id={id} />
      {lead && (
        <p className="lead" data-reveal style={{ ['--delay' as string]: 160 }}>
          {lead}
        </p>
      )}
    </header>
  );
}

/* ───────────────────────── Responsive picture ───────────────────────── */

interface PictureProps {
  image: ResponsiveImage;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function Picture({ image, sizes, className, priority, alt }: PictureProps) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={image.avif} sizes={sizes} />
      <source type="image/webp" srcSet={image.webp} sizes={sizes} />
      <img
        src={image.fallback}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  );
}

/* ───────────────────────── KD monogram ───────────────────────── */

export function KDMark({ size = 40, className, decorative = false }: { size?: number; className?: string; decorative?: boolean }) {
  return (
    <img
      className={className}
      src={size > 120 ? kdLogo.large : kdLogo.small}
      srcSet={`${kdLogo.small} 160w, ${kdLogo.large} 640w`}
      sizes={`${size}px`}
      width={size}
      height={size}
      alt={decorative ? '' : 'KD monogram'}
      decoding="async"
    />
  );
}
