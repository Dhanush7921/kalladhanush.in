import { useCallback, useEffect, useRef, useState } from 'react';
import { worldTiles, type WorldTheme, type WorldTile } from '../content/portfolio';
import { pillarPortrait, travelPortrait, type ResponsiveImage } from '../content/assets';
import { Picture, SectionHeading } from '../components/UI';
import Icon from '../components/Icon';
import { useReveal } from '../hooks/useMotion';
import './MyWorld.css';

type Filter = 'All' | WorldTheme;
const filters: Filter[] = ['All', 'Photography', 'Film', 'Motorcycles', 'Travel', 'Lifestyle', 'Experiments'];
const photos: Record<'travel' | 'pillar', ResponsiveImage> = { travel: travelPortrait, pillar: pillarPortrait };
const areaOf: Record<WorldTheme, string> = {
  Travel: 'travel',
  Photography: 'photo',
  Film: 'film',
  Lifestyle: 'pillar',
  Motorcycles: 'moto',
  Experiments: 'exp',
};

function Lightbox({ items, index, onClose, onNav }: { items: WorldTile[]; index: number | null; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const tile = index === null ? null : items[index];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (tile && !d.open) {
      d.showModal();
      document.body.classList.add('is-locked');
    }
  }, [tile]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handle = () => {
      document.body.classList.remove('is-locked');
      onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    d.addEventListener('close', handle);
    d.addEventListener('keydown', key);
    return () => {
      d.removeEventListener('close', handle);
      d.removeEventListener('keydown', key);
    };
  }, [onClose, onNav]);

  return (
    <dialog
      ref={ref}
      className="dialog lightbox"
      aria-label={tile ? `${tile.title} — photo` : 'Photo viewer'}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {tile?.photo && (
        <figure className="lightbox__figure">
          <Picture image={photos[tile.photo]} sizes="(min-width: 900px) 60vw, 92vw" className="lightbox__img" />
          <figcaption>
            <span className="lightbox__theme">{tile.theme}</span>
            {tile.title}
          </figcaption>
        </figure>
      )}
      <button type="button" className="dialog__close" onClick={() => ref.current?.close()}>
        <Icon name="close" />
        <span className="visually-hidden">Close photo</span>
      </button>
      {items.length > 1 && (
        <div className="lightbox__nav">
          <button type="button" onClick={() => onNav(-1)}>
            <Icon name="chevronLeft" />
            <span className="visually-hidden">Previous photo</span>
          </button>
          <button type="button" onClick={() => onNav(1)}>
            <Icon name="chevronRight" />
            <span className="visually-hidden">Next photo</span>
          </button>
        </div>
      )}
    </dialog>
  );
}

export default function MyWorld() {
  const ref = useReveal<HTMLElement>();
  const [filter, setFilter] = useState<Filter>('All');
  const [open, setOpen] = useState<number | null>(null);
  const list = filter === 'All' ? worldTiles : worldTiles.filter((t) => t.theme === filter);
  const photoTiles = worldTiles.filter((t) => t.photo);

  const close = useCallback(() => setOpen(null), []);
  const nav = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + photoTiles.length) % photoTiles.length)), [photoTiles.length]);

  return (
    <section id="world" ref={ref} className="section world" aria-labelledby="world-title">
      <div className="container">
        <div className="world__head">
          <SectionHeading
            index="06"
            label="My World"
            id="world-title"
            title={['Beyond the', { em: 'Screen' }]}
            lead="The person behind the engineer — the places, machines, stories and habits that shape how I see and build."
          />
          <div className="chip-row world__filters" role="group" aria-label="Filter by theme" data-reveal>
            {filters.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="world__wrap" data-reveal="fade">
        <ul className={`world__grid${filter === 'All' ? '' : ' is-filtered'}`} role="list" key={filter}>
          {list.map((t, i) => (
            <li key={t.theme} className={`wtile${t.photo ? ' wtile--photo' : ' wtile--panel'}`} style={{ gridArea: filter === 'All' ? areaOf[t.theme] : undefined, ['--i' as string]: i }}>
              {t.photo ? (
                <button type="button" className="wtile__btn" onClick={() => setOpen(photoTiles.indexOf(t))} aria-haspopup="dialog">
                  <Picture image={photos[t.photo]} sizes="(min-width: 1000px) 50vw, 100vw" />
                  <span className="wtile__shade" aria-hidden="true" />
                  <span className="wtile__caption">
                    <span className="wtile__theme">
                      <Icon name={t.icon} /> {t.theme}
                    </span>
                    <span className="wtile__title">{t.title}</span>
                    <span className="wtile__text">{t.text}</span>
                  </span>
                  <span className="wtile__zoom" aria-hidden="true">
                    <Icon name="arrowUpRight" />
                  </span>
                  <span className="visually-hidden">— open photo</span>
                </button>
              ) : (
                <article className="wtile__panel">
                  <span className="wtile__icon" aria-hidden="true">
                    <Icon name={t.icon} />
                  </span>
                  <p className="wtile__theme">{t.theme}</p>
                  <h3 className="wtile__title">{t.title}</h3>
                  <p className="wtile__text">{t.text}</p>
                  <p className="wtile__soon">Gallery opening soon</p>
                </article>
              )}
            </li>
          ))}
        </ul>
        </div>
      </div>
      <Lightbox items={photoTiles} index={open} onClose={close} onNav={nav} />
    </section>
  );
}
