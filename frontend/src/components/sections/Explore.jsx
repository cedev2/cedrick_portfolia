import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';

/**
 * Compact entry points to the standalone pages.
 * The full content lives on /projects, /education and /blog so the landing
 * page stays short.
 */
const Explore = () => {
  const { projects, education, blogs } = usePortfolio();

  const entries = [
    {
      to: '/projects',
      icon: 'fa-folder-open',
      title: 'Projects',
      description: 'Products and platforms I designed, built and shipped.',
      count: projects.length,
      label: 'project',
    },
    {
      to: '/education',
      icon: 'fa-graduation-cap',
      title: 'Education',
      description: 'My academic background and professional journey.',
      count: education.length,
      label: 'entry',
    },
    {
      to: '/blog',
      icon: 'fa-blog',
      title: 'Blog',
      description: 'Articles and notes about modern web development.',
      count: blogs.length,
      label: 'post',
    },
  ];

  return (
    <section className="section bg-white" id="explore">
      <div className="container">
        <SectionHeader
          subtitle="KEEP EXPLORING"
          title="More"
          highlight="Content"
          icon="fa-compass"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <Reveal key={entry.to} delay={index * 80}>
              <Link
                to={entry.to}
                className="group card flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-xl text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                  <i className={`fas ${entry.icon}`} />
                </span>

                <h3 className="mt-5 text-lg font-semibold text-ink">{entry.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{entry.description}</p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-600">
                  {entry.count} {entry.label}
                  {(entry.count === 1 ? '' : 's')}
                  <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Explore;
