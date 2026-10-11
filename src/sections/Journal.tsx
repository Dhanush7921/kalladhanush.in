import { journal } from '../content/portfolio';
import { SectionHeading } from '../components/UI';
import Icon from '../components/Icon';
import { useReveal } from '../hooks/useMotion';
import './Journal.css';

export default function Journal() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="journal" ref={ref} className="section journal" aria-labelledby="journal-title">
      <div className="container journal__inner">
        <SectionHeading index="08" label="Creator's Journal" id="journal-title" title={['Notes from the', { em: 'Workbench' }]} />
        {journal.length > 0 ? (
          <ul className="journal__list" role="list">
            {journal.map((a) => (
              <li key={a.href} data-reveal>
                <a className="journal__entry" href={a.href}>
                  <time dateTime={a.date}>{a.date}</time>
                  <span className="journal__title">{a.title}</span>
                  <span className="journal__summary">{a.summary}</span>
                  <Icon name="arrowUpRight" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="journal__soon" data-reveal>
            <span className="journal__pen" aria-hidden="true">
              <Icon name="pen" />
            </span>
            <div>
              <p className="journal__soon-label">Coming soon</p>
              <p className="journal__soon-text">
                Field notes on engineering, design and visual storytelling are being written. The first entries will appear here — no placeholders in the
                meantime.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
