import { certificates, experience } from '../content/portfolio';
import { SectionHeading } from '../components/UI';
import Icon from '../components/Icon';
import { useReveal } from '../hooks/useMotion';
import './Experience.css';

export default function Experience() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="experience" ref={ref} className="section experience" aria-labelledby="experience-title">
      <div className="container experience__grid">
        <div className="experience__intro">
          <SectionHeading
            index="05"
            label="Experience & Learning"
            id="experience-title"
            title={['Learning. Building.', { em: 'Evolving.' }]}
            lead="Internships and training that shaped how I build — listed only where they can be verified."
          />
        </div>

        <ol className="xp-list" role="list">
          {experience.map((x, i) => (
            <li key={x.org + x.title} className={`xp${x.current ? ' is-current' : ''}`} data-reveal style={{ ['--delay' as string]: i * 90 }}>
              <span className="xp__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="xp__main">
                <p className="xp__type">
                  {x.type}
                  {x.current && <span className="xp__badge">Current</span>}
                </p>
                <h3 className="xp__title">{x.title}</h3>
                <p className="xp__org">{x.org}</p>
                <p className="xp__text">{x.text}</p>
              </div>
              {x.when && <p className="xp__when">{x.when}</p>}
            </li>
          ))}
        </ol>
      </div>

      <div className="container">
        {certificates.length > 0 ? (
          <ul className="certs" role="list">
            {certificates.map((c) => (
              <li key={c.title} className="cert frame-gold" data-reveal>
                <img src={c.image} alt={`${c.title} certificate, issued by ${c.issuer}`} loading="lazy" />
                <p className="cert__title">{c.title}</p>
                <p className="cert__meta">
                  {c.issuer}
                  {c.date && ` · ${c.date}`}
                </p>
                {c.verifyUrl && (
                  <a className="text-link" href={c.verifyUrl} target="_blank" rel="noopener noreferrer">
                    Verify <Icon name="arrowUpRight" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="certs-empty" data-reveal>
            <div className="certs-empty__frames" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <p className="certs-empty__label">Certificate wall</p>
              <p className="certs-empty__text">
                Verified certificates will be displayed here as original copies are added. Nothing is shown until it can be checked.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
