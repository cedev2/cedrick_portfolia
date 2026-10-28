import { Link } from 'react-router-dom';

/**
 * Header used by the standalone pages (projects, education, ...).
 */
const PageHero = ({ eyebrow, title, highlight, description, icon = 'fa-code', breadcrumbs = [] }) => (
  <section className="relative overflow-hidden bg-primary-50 pt-32 pb-16 sm:pt-36">
    <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-200/50 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-sand-200/50 blur-3xl" />

    <div className="container relative text-center">
      {breadcrumbs.length > 0 ? (
        <nav className="mb-4 flex items-center justify-center gap-2 text-xs text-ink-400">
          <Link to="/" className="transition-colors hover:text-primary-600">
            Home
          </Link>
          <i className="fas fa-chevron-right text-[0.6rem]" />
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb} className={index === breadcrumbs.length - 1 ? 'text-ink-600' : ''}>
              {crumb}
            </span>
          ))}
        </nav>
      ) : null}

      <span className="section-subtitle block">{eyebrow}</span>

      <h1 className="section-title mt-2 text-4xl sm:text-5xl">
        {title} {highlight ? <span className="gradient-text">{highlight}</span> : null}
      </h1>

      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-500">{description}</p>
      ) : null}

      <div className="section-divider">
        <span className="divider-line" />
        <i className={`fas ${icon} gradient-text`} />
        <span className="divider-line" />
      </div>
    </div>
  </section>
);

export default PageHero;
