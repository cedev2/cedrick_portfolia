import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import LoadMore from '../ui/LoadMore.jsx';
import Reveal from '../ui/Reveal.jsx';

const Services = () => {
  const { services } = usePortfolio();
  const [expanded, setExpanded] = useState(false);

  if (!services.length) return null;

  const visible = expanded ? services : services.slice(0, 3);

  return (
    <section className="section bg-white" id="services">
      <div className="container">
        <SectionHeader
          subtitle="WHAT I DO"
          title="My"
          highlight="Services"
          icon="fa-cogs"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service, index) => (
            <Reveal key={service._id} delay={index * 80}>
              <article className="card group h-full text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-2xl text-primary-500 transition-all duration-300 group-hover:bg-teal-gradient group-hover:text-white">
                  <i className={`fas ${service.icon || 'fa-gears'}`} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-ink">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{service.description}</p>

                {service.pricing ? (
                  <p className="mt-4 inline-block rounded-full bg-sand-100 px-4 py-1.5 text-xs font-semibold text-sand-500">
                    {service.pricing}
                  </p>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>

        <LoadMore
          total={services.length}
          limit={3}
          label="Load More Services"
          onLoaded={() => setExpanded(true)}
        />
      </div>
    </section>
  );
};

export default Services;
