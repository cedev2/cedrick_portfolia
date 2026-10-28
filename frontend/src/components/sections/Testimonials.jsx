import { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';

const Testimonials = () => {
  const { testimonials } = usePortfolio();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % testimonials.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const active = testimonials[index];

  return (
    <section className="section bg-white" id="testimonials">
      <div className="container">
        <SectionHeader
          subtitle="TESTIMONIALS"
          title="What People"
          highlight="Say"
          icon="fa-quote-right"
        />

        <Reveal>
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="card text-center">
              <div className="flex justify-center gap-1 text-sand-400">
                {Array.from({ length: active.rating ?? 5 }).map((_, star) => (
                  <i key={star} className="fas fa-star" />
                ))}
              </div>

              <p className="mt-5 text-lg italic leading-relaxed text-ink-700">
                &ldquo;{active.content}&rdquo;
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-gradient text-white">
                  <i className="fas fa-user" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-ink">{active.name}</h4>
                  <p className="text-xs text-ink-400">
                    {active.position}
                    {active.company ? ` at ${active.company}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {testimonials.map((item, dot) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setIndex(dot)}
                  className={`h-2.5 rounded-full transition-all ${
                    dot === index ? 'w-7 bg-primary-500' : 'w-2.5 bg-ink-200 hover:bg-primary-300'
                  }`}
                  aria-label={`Show testimonial ${dot + 1}`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Testimonials;
