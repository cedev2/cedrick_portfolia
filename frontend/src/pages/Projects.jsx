import { useMemo, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { assetUrl, splitList, truncate } from '../utils/format.js';
import PageHero from '../components/ui/PageHero.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import { PageLoader } from '../components/ui/ErrorState.jsx';

const Projects = () => {
  const { projects, loading } = usePortfolio();
  const [category, setCategory] = useState('all');

  const normalize = (value) =>
    (value ?? '').charAt(0).toUpperCase() + (value ?? '').slice(1).toLowerCase();

  const categories = useMemo(() => {
    const unique = projects.map((project) => normalize(project.category)).filter(Boolean);
    return ['all', ...Array.from(new Set(unique))];
  }, [projects]);

  const visible = useMemo(
    () =>
      category === 'all'
        ? projects
        : projects.filter((project) => normalize(project.category) === category),
    [projects, category],
  );

  return (
    <div className="bg-white pt-0">
      <PageHero
        eyebrow="MY WORK"
        title="Featured"
        highlight="Projects"
        icon="fa-folder-open"
        description="A selection of the products, platforms and tools I have designed and built from scratch."
        breadcrumbs={['Projects']}
      />

      <section className="section pt-16">
        <div className="container">
          {categories.length > 1 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === item
                      ? 'bg-teal-gradient text-white'
                      : 'border border-ink-200 text-ink-500 hover:border-primary-500 hover:text-primary-600'
                  }`}
                >
                  {item === 'all' ? 'All' : item}
                </button>
              ))}
            </div>
          ) : null}

          {loading ? (
            <PageLoader label="Loading projects..." />
          ) : visible.length === 0 ? (
            <p className="mt-14 text-center text-ink-400">No projects published yet.</p>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project, index) => {
                const techs = splitList(project.technologies);

                return (
                  <Reveal key={project._id} delay={index * 70}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover">
                      {project.thumbnail ? (
                        <div className="h-48 overflow-hidden bg-primary-50">
                          <SmartImage
                            src={assetUrl(project.thumbnail)}
                            alt={project.title}
                            loading="lazy"
                            fallbackIcon="fa-folder-open"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-primary-50 text-4xl text-primary-400">
                          <i className="fas fa-folder-open" />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-ink">{project.title}</h3>
                          {project.status ? (
                            <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-600">
                              {project.status}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                          {truncate(project.description, 160)}
                        </p>

                        {techs.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {techs.map((tech) => (
                              <span key={tech} className="tech-tag">
                                {tech}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-3">
                          {project.live_url ? (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary btn-sm"
                            >
                              <i className="fas fa-external-link-alt" /> Live
                            </a>
                          ) : null}
                          {project.github_url ? (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm border border-ink-200 text-ink-700 transition-colors hover:border-primary-500 hover:text-primary-600"
                            >
                              <i className="fab fa-github" /> Code
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
