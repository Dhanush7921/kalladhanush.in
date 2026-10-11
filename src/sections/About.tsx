import { about, journey, site } from '../content/portfolio';
import { travelPortrait } from '../content/assets';
import { Picture, SectionHeading } from '../components/UI';
import Icon from '../components/Icon';
import { useReveal } from '../hooks/useMotion';
import './About.css';

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__media">
          <span className="about__frame" aria-hidden="true" />
          <div className="about__photo reveal-image">
            <Picture image={travelPortrait} sizes="(min-width: 1000px) 38vw, 92vw" />
          </div>
          <p className="about__chip" data-reveal style={{ ['--delay' as string]: 500 }}>
            <Icon name="mapPin" />
            <span>
              Based in <strong>{site.location}</strong>
            </span>
          </p>
        </div>

        <div className="about__body">
          <SectionHeading index="02" label="About Me" id="about-title" title={['The Mind Behind the', { em: 'Vision' }]} />
          <p className="about__intro" data-reveal style={{ ['--delay' as string]: 120 }}>
            {about.intro}
          </p>
          <ul className="about__traits" role="list">
            {about.traits.map((t, i) => (
              <li key={t.title} className="trait" data-reveal style={{ ['--delay' as string]: 160 + i * 80 }}>
                <span className="trait__icon shimmer" aria-hidden="true">
                  <Icon name={t.icon} />
                </span>
                <div>
                  <h3 className="trait__title">{t.title}</h3>
                  <p className="trait__text">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container journey">
        <div className="journey__head" data-reveal>
          <h3 className="journey__label">The journey so far</h3>
          <span className="hairline" aria-hidden="true" />
        </div>
        <ol className="journey__list" role="list" data-reveal="fade" style={{ ['--n' as string]: journey.length }}>
          {journey.map((j, i) => (
            <li key={j.title} className={`journey__item${j.current ? ' is-current' : ''}`} style={{ ['--i' as string]: i }}>
              <span className="journey__node" aria-hidden="true" />
              <p className="journey__kind">
                {j.kind}
                {j.current && <span className="journey__now">Current</span>}
              </p>
              <h4 className="journey__title">{j.title}</h4>
              <p className="journey__place">{j.place}</p>
              {j.when && <p className="journey__when">{j.when}</p>}
              <p className="journey__text">{j.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
