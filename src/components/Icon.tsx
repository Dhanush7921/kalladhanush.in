import type { ReactNode, SVGProps } from 'react';

/** Custom line-icon set (24×24, 1.5 stroke). Brand marks are intentionally avoided — labels name each service. */
const paths = {
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  arrowDown: <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  chevronLeft: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 8.5h16M8 15.5h12" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5" />
      <path d="M15.5 8.5V6.5a2.5 2.5 0 0 0-2.5-2.5H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 6.8 8.2 6.2 8.2-6.2" />
    </>
  ),
  code: <path d="M8 7.5 3.5 12 8 16.5M16 7.5l4.5 4.5-4.5 4.5M13.6 4.5l-3.2 15" />,
  aperture: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3l3.6 6.2M21 12h-7.2M16.5 19.8 12.9 13.6M7.5 19.8l3.6-6.2M3 12h7.2M7.5 4.2l3.6 6.2" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  mapPin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z" />
    </>
  ),
  sparkle: <path d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9Z" />,
  flip: <path d="M4 9a8 8 0 0 1 14.5-3.5M20 4.5v4h-4M20 15a8 8 0 0 1-14.5 3.5M4 19.5v-4h4" />,
  ai: (
    <>
      <circle cx="5" cy="7.5" r="1.8" />
      <circle cx="5" cy="16.5" r="1.8" />
      <circle cx="12" cy="4.5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19.5" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
      <path d="M6.6 6.7 10.4 5.2M6.7 8.5l3.6 2.6M6.7 15.5l3.6-2.6M6.6 17.3l3.8 1.5M13.7 5.3l3.9 5.6M13.8 12H17.2M13.7 18.7l3.9-5.6" />
    </>
  ),
  web: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 8.5h18M10 12.2l-2 2.3 2 2.3M14 12.2l2 2.3-2 2.3" />
    </>
  ),
  app: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
      <path d="M10.5 18.5h3M10.5 5.5h3" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.8" />
      <rect x="10" y="10" width="4" height="4" rx=".6" />
      <path d="M9.5 3.5V7M14.5 3.5V7M9.5 17v3.5M14.5 17v3.5M3.5 9.5H7M3.5 14.5H7M17 9.5h3.5M17 14.5h3.5" />
    </>
  ),
  camera: (
    <>
      <path d="M4.5 7.5h2.8l1.6-2.5h6.2l1.6 2.5h2.8A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="13" r="3.6" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M7 4.5v15M17 4.5v15M3 9h4M3 15h4M17 9h4M17 15h4" />
      <path d="m10.5 10 3.5 2-3.5 2Z" />
    </>
  ),
  pen: (
    <>
      <path d="M12 3 18.5 11 12 21 5.5 11Z" />
      <path d="M12 3v7" />
      <circle cx="12" cy="11.5" r="1.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r=".9" />
      <path d="M12 1.5V5M12 19v3.5M1.5 12H5M19 12h3.5" />
    </>
  ),
  bike: (
    <>
      <circle cx="5.5" cy="16" r="3.5" />
      <circle cx="18.5" cy="16" r="3.5" />
      <path d="M5.5 16 9.5 10h5.5l3.5 6M9.5 10 8 7H5.5M15 10l1.2-3h2.3M12 16l3-6" />
    </>
  ),
  mountain: (
    <>
      <path d="M2.5 19.5 9 9l4 6 2.6-3.6 5.9 8.1Z" />
      <circle cx="17" cy="6" r="1.8" />
    </>
  ),
  pulse: <path d="M3 12.5h4.2l2.3-5.5 4 11 2.4-5.5H21" />,
  flask: (
    <>
      <path d="M9.5 3h5M10.2 3v6.4L5 18.4A1.7 1.7 0 0 0 6.5 21h11a1.7 1.7 0 0 0 1.5-2.6l-5.2-9V3" />
      <path d="M7.2 15h9.6" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="12" r="6.6" />
      <path d="M12 2.5v2.9M12 18.6v2.9M2.5 12h2.9M18.6 12h2.9M5.3 5.3l2 2M16.7 16.7l2 2M5.3 18.7l2-2M16.7 7.3l2-2" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(-28 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(28 12 12)" />
    </>
  ),
  cube: <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9ZM12 12l8-4.5M12 12v9M12 12 4 7.5" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  title?: string;
}

export default function Icon({ name, title, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ? `icon ${className}` : 'icon'}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}
