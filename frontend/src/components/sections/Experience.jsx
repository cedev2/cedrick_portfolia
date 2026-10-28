import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { formatDateRange } from '../../utils/format.js';
import SectionHeader from '../ui/SectionHeader.jsx';
import LoadMore from '../ui/LoadMore.jsx';
import Reveal from '../ui/Reveal.jsx';

const Experience = () => {
  const { experience } = usePortfolio();
  const [expanded, setExpanded] = useState(false);

  if (!experience.length) return null;

  const visible = expanded ? experience : experience.slice(0, 2);

  return (
    <section className="section bg-white" id="experience">
      <div className="container">
        <SectionHeader
          subtitle="MY JOURNEY"
          title="Work"
          highlight="Experience"
          icon="fa-briefcase"
        />

        <div className="relative mt-14">
          <span className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-ink-100 md:block" />

          <div className="space-y-6">
            {visible.map((item, index) => (
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

                    <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <LoadMore
          total={experience.length}
          limit={2}
          label="Load More Experience"
          onLoaded={() => setExpanded(true)}
        />
      </div>
    </section>
  );
};

export default Experience;
