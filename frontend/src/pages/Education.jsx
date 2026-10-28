import { usePortfolio } from '../context/PortfolioContext.jsx';
import { formatDateRange } from '../utils/format.js';
import PageHero from '../components/ui/PageHero.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import { PageLoader } from '../components/ui/ErrorState.jsx';

const Education = () => {
  const { education, experience, loading } = usePortfolio();

  return (
    <div className="bg-white pt-0">
      <PageHero
        eyebrow="MY BACKGROUND"
        title="Education &"
        highlight="Training"
        icon="fa-graduation-cap"
        description="Where I studied, what I focused on and the experience I gained along the way."
        breadcrumbs={['Education']}
      />

      <section className="section pt-16">
        <div className="container">
          {loading ? (
            <PageLoader label="Loading education..." />
          ) : education.length === 0 ? (
            <p className="text-center text-ink-400">No education records yet.</p>
          ) : (
            <div className="relative">
              <span className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-ink-100 md:block" />

              <div className="space-y-6">
                {education.map((item, index) => (
                  <Reveal key={item._id} delay={index * 80}>
                    <div className="relative md:pl-16">
                      <span className="absolute left-2.5 top-6 hidden h-3.5 w-3.5 rounded-full border-[3px] border-white bg-primary-500 shadow-soft md:block" />

                      <div className="card">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                          {formatDateRange(item.start_date, item.end_date, item.is_current)}
                        </span>

                        <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
                        <h4 className="gradient-text font-medium">{item.institution}</h4>

                        {item.location ? (
                          <p className="mt-1 text-xs text-ink-400">
                            <i className="fas fa-map-marker-alt" /> {item.location}
                          </p>
                        ) : null}

                        {item.description ? (
                          <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {experience.length > 0 ? (
            <div className="mt-20">
              <div className="text-center">
                <span className="section-subtitle block">MY JOURNEY</span>
                <h2 className="section-title mt-2">
                  Work <span className="gradient-text">Experience</span>
                </h2>
                <div className="section-divider">
                  <span className="divider-line" />
                  <i className="fas fa-briefcase gradient-text" />
                  <span className="divider-line" />
                </div>
              </div>

              <div className="relative mt-14">
                <span className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-ink-100 md:block" />

                <div className="space-y-6">
                  {experience.map((item, index) => (
                    <Reveal key={item._id} delay={index * 80}>
                      <div className="relative md:pl-16">
                        <span className="absolute left-2.5 top-6 hidden h-3.5 w-3.5 rounded-full border-[3px] border-white bg-primary-500 shadow-soft md:block" />

                        <div className="card">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                            {formatDateRange(item.start_date, item.end_date, item.is_current)}
                          </span>

                          <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
                          <h4 className="gradient-text font-medium">{item.company}</h4>

                          {item.location ? (
                            <p className="mt-1 text-xs text-ink-400">
                              <i className="fas fa-map-marker-alt" /> {item.location}
                            </p>
                          ) : null}

                          {item.description ? (
                            <p className="mt-3 text-sm leading-relaxed text-ink-500">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Education;
