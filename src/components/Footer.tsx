import { channels, nav, site } from '../content/portfolio';
import { KDMark } from './UI';
import Icon from './Icon';
import './Footer.css';

export default function Footer({ hidden, onReplayIntro }: { hidden: boolean; onReplayIntro: () => void }) {
  return (
    <footer className="site-footer" inert={hidden}>
      <div className="container">
        <div className="footer__top">
          <a href="#home" className="footer__brand">
            <KDMark size={56} decorative />
            <span>
              <span className="footer__name">{site.nameUpper}</span>
              <span className="footer__tagline">{site.tagline}</span>
            </span>
          </a>
          <nav aria-label="Footer">
            <ul role="list" className="footer__nav">
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <ul role="list" className="footer__social">
            {channels.map((c) => (
              <li key={c.label}>
                <a href={c.href} aria-label={c.external ? `${c.label} (opens in a new tab)` : c.label} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <Icon name={c.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          Kalla Dhanush
        </p>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.domain}
          </p>
          <div className="footer__actions">
            <button type="button" className="footer__link" onClick={onReplayIntro}>
              Replay intro
            </button>
            <a className="footer__link" href="#home">
              Back to top <Icon name="arrowRight" style={{ rotate: '-90deg' }} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
