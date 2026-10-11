import { useEffect, useState } from 'react';
import { site } from '../content/portfolio';
import { heroPortrait } from '../content/assets';
import { Button, Picture } from '../components/UI';
import HeroVisual from './HeroVisual';
import './Hero.css';

export default function Hero({ ready }: { ready: boolean }) {
  const [entered, setEntered] = useState(false);

  // Start the entrance one frame after the intro hands over, so transitions actually run.
  useEffect(() => {
    if (!ready) {
      setEntered(false);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [ready]);

  const support = site.support.split('.').map((s) => s.trim()).filter(Boolean);

  return (
    <section id="home" className={`hero${entered ? ' is-entered' : ''}`} aria-labelledby="hero-title">
      <div className="hero__atmos" aria-hidden="true">
        <span className="hero__beam hero__beam--a" />
        <span className="hero__beam hero__beam--b" />
      </div>

      <div className="hero__stage">
        <HeroVisual active={ready} />
        <figure className="hero__portrait">
          <div className="hero__arch frame-gold">
            <Picture image={heroPortrait} sizes="(min-width: 1100px) 440px, 64vw" priority />
            <span className="hero__arch-grade" aria-hidden="true" />
          </div>
          <span className="hero__floor" aria-hidden="true" />
        </figure>
      </div>

      <div className="hero__content container">
        <div className="hero__text">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-line" aria-hidden="true" />
            {site.nameUpper}
          </p>
          <h1 id="hero-title" className="hero__title">
            {site.roles.map((role, i) => (
              <span className="hero__role" key={role} style={{ ['--i' as string]: i }}>
                <span className="hero__role-inner">{role}</span>
                {i < site.roles.length - 1 && <span className="visually-hidden"> | </span>}
              </span>
            ))}
          </h1>
          <p className="hero__support">
            {support.map((word, i) => (
              <span key={word}>
                {i > 0 && <span className="hero__dot" aria-hidden="true" />}
                {word}.
              </span>
            ))}
          </p>
          <p className="hero__tagline">{site.tagline}</p>
          <p className="hero__desc">{site.intro}</p>
          <div className="hero__ctas">
            <Button href="#projects" icon="arrowRight">
              Explore My Work
            </Button>
            <Button href="#world" variant="ghost">
              Discover My World
            </Button>
          </div>
        </div>
      </div>

      <a href="#about" className="hero__scroll">
        <span className="hero__scroll-track" aria-hidden="true">
          <span />
        </span>
        Scroll to explore
      </a>
      <p className="hero__side" aria-hidden="true">
        17.69° N · 83.22° E — {site.location}
      </p>
    </section>
  );
}
