import { useCallback, useEffect, useRef, useState } from 'react';
import { projects, projectCategories, type Project, type ProjectCategory } from '../content/portfolio';
import { SectionHeading } from '../components/UI';
import ProjectArt from '../components/ProjectArt';
import Icon from '../components/Icon';
import { useReveal, useTilt } from '../hooks/useMotion';
import './Projects.css';

type Filter = 'All' | ProjectCategory;

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  const tilt = useTilt<HTMLElement>(6);
  const confidential = project.visibility === 'confidential';
  return (
    <article
      ref={tilt}
      className={`pcard${confidential ? ' pcard--confidential' : ''}`}
      aria-labelledby={`pcard-${project.id}`}
      onClick={(e) => {
        // Whole card opens details for pointer users; the button remains the keyboard/screen-reader control.
        if (!(e.target as HTMLElement).closest('button')) onOpen(project.id);
      }}
    >
      <div className="pcard__inner">
        <div className="pcard__art">
          <ProjectArt kind={project.art} />
          <span className="pcard__glare" aria-hidden="true" />
        </div>
        <div className="pcard__meta">
          <span className="pcard__index">{project.index}</span>
          <span className="pcard__cats">{project.categories.join(' · ')}</span>
        </div>
        <div className="pcard__body">
          <p className="pcard__status">
            {confidential ? <Icon name="lock" /> : <span className="status-dot" aria-hidden="true" />}
            {project.status}
          </p>
          <h3 id={`pcard-${project.id}`} className="pcard__title">
            {project.title}
          </h3>
          <p className="pcard__subtitle">{project.subtitle}</p>
          <p className="pcard__summary">{project.summary}</p>
          {project.stack && (
            <ul className="pcard__stack" role="list" aria-label="Technologies">
              {project.stack.slice(0, 4).map((s) => (
                <li key={s} className="tag">
                  {s}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="pcard__open" aria-haspopup="dialog" onClick={() => onOpen(project.id)}>
            {confidential ? 'Project overview' : 'View case study'}
            <span className="visually-hidden">: {project.title}</span>
            <Icon name="arrowUpRight" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) {
      d.showModal();
      document.body.classList.add('is-locked');
    }
  }, [project]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handle = () => {
      document.body.classList.remove('is-locked');
      onClose();
    };
    d.addEventListener('close', handle);
    return () => d.removeEventListener('close', handle);
  }, [onClose]);

  const confidential = project?.visibility === 'confidential';
  const sections = project
    ? ([
        ['The problem', project.problem],
        ['The approach', project.approach],
        ['My role', project.role],
        ['Outcome', project.outcome],
      ] as const).filter(([, v]) => !!v)
    : [];

  return (
    <dialog
      ref={ref}
      className="dialog pdialog"
      aria-labelledby="pdialog-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {project && (
        <div className="dialog__scroll">
          <button type="button" className="dialog__close" onClick={() => ref.current?.close()}>
            <Icon name="close" />
            <span className="visually-hidden">Close project details</span>
          </button>
          <div className="pdialog__art">
            <ProjectArt kind={project.art} />
          </div>
          <div className="pdialog__body">
            <p className="eyebrow">
              <span className="eyebrow__index">{project.index}</span>
              <span className="eyebrow__line" aria-hidden="true" />
              {project.categories.join(' · ')}
            </p>
            <h2 id="pdialog-title" className="pdialog__title">
              {project.title}
            </h2>
            <p className="pdialog__subtitle">{project.subtitle}</p>
            <p className="pdialog__status tag tag--gold">
              {confidential ? <Icon name="lock" /> : <span className="status-dot" aria-hidden="true" />}
              {project.status}
            </p>
            <p className="pdialog__summary">{project.summary}</p>

            {confidential ? (
              <div className="pdialog__confidential">
                <Icon name="lock" />
                <p>
                  This is company / client work. Screenshots, technical detail and results are withheld until publication is approved — a fuller walkthrough is
                  available on request.
                </p>
              </div>
            ) : (
              <dl className="pdialog__grid">
                {sections.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {project.stack && (
              <div className="pdialog__stack">
                <h3>Built with</h3>
                <ul role="list">
                  {project.stack.map((s) => (
                    <li key={s} className="tag">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.links && (
              <div className="pdialog__links">
                {project.links.map((l) => (
                  <a key={l.href} className="text-link" href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} <Icon name="arrowUpRight" />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            )}
            <p className="pdialog__note">Artwork above is illustrative, not a product screenshot.</p>
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function Projects() {
  const ref = useReveal<HTMLElement>();
  const [filter, setFilter] = useState<Filter>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const list = filter === 'All' ? projects : projects.filter((p) => p.categories.includes(filter));
  const count = (f: Filter) => (f === 'All' ? projects.length : projects.filter((p) => p.categories.includes(f)).length);
  // Only offer categories that currently have projects.
  const filters: Filter[] = ['All', ...projectCategories.filter((c) => count(c) > 0)];
  const close = useCallback(() => setOpenId(null), []);

  return (
    <section id="projects" ref={ref} className="section projects" aria-labelledby="projects-title">
      <span className="glow-orb projects__orb" aria-hidden="true" />
      <div className="container">
        <div className="projects__head">
          <SectionHeading
            index="03"
            label="Projects Showcase"
            id="projects-title"
            title={['Selected', { em: 'Works' }]}
            lead="Products, platforms and experiences — designed and built end to end, from first idea to working software."
          />
          <div className="chip-row projects__filters" role="group" aria-label="Filter projects by category" data-reveal>
            {filters.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f}
                <span className="chip__count">{count(f)}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="visually-hidden" aria-live="polite">
          {filter === 'All' ? `Showing all ${list.length} projects` : `Showing ${list.length} ${filter} projects`}
        </p>

        <div className="projects__wrap" data-reveal="fade">
          <ul className="projects__grid" role="list" key={filter}>
            {list.map((p, i) => (
              <li key={p.id} style={{ ['--i' as string]: i }}>
                <ProjectCard project={p} onOpen={setOpenId} />
              </li>
            ))}
          </ul>
        </div>

        <p className="projects__note" data-reveal>
          <Icon name="sparkle" />
          Card artwork is illustrative, not product screenshots.
        </p>
      </div>
      <ProjectDialog project={projects.find((p) => p.id === openId) ?? null} onClose={close} />
    </section>
  );
}
