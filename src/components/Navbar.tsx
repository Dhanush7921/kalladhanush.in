import { useEffect, useRef, useState } from 'react';
import { nav, site } from '../content/portfolio';
import Icon from './Icon';
import { KDMark, Button } from './UI';
import './Navbar.css';

export default function Navbar({ hidden }: { hidden: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('home');
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll state + progress line (rAF-throttled)
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Active section tracking
  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Mobile menu: lock scroll, make page inert, Esc to close, restore focus
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById('main');
    const footer = document.querySelector('footer');
    document.body.classList.add('is-locked');
    main?.setAttribute('inert', '');
    footer?.setAttribute('inert', '');
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1080) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    const toggle = toggleRef.current;
    return () => {
      document.body.classList.remove('is-locked');
      main?.removeAttribute('inert');
      footer?.removeAttribute('inert');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`} inert={hidden}>
      <div className="site-header__bar container">
        <a href="#home" className="brand" aria-label={`${site.name} — back to top`} onClick={close}>
          <KDMark size={40} className="brand__mark" decorative />
          <span className="brand__name">{site.nameUpper}</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul role="list">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className={active === item.id ? 'is-active' : undefined} aria-current={active === item.id ? 'true' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__cta">
          <Button href="#contact" size="sm" icon="arrowRight">
            Let&rsquo;s Connect
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-toggle__lines" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
      <span ref={progressRef} className="scroll-progress" aria-hidden="true" />

      <div id="mobile-menu" ref={panelRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          <ol role="list" className="mobile-menu__list">
            {nav.map((item, i) => (
              <li key={item.id} style={{ ['--i' as string]: i }}>
                <a href={`#${item.id}`} onClick={close} aria-current={active === item.id ? 'true' : undefined}>
                  <span className="mobile-menu__num">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mobile-menu__foot">
          <Button href="#contact" icon="arrowRight" onClick={close}>
            Let&rsquo;s Connect
          </Button>
          <p>
            <Icon name="mapPin" /> {site.location}
          </p>
        </div>
      </div>
    </header>
  );
}
