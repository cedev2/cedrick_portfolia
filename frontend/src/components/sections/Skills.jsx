import { useMemo, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import LoadMore from '../ui/LoadMore.jsx';
import Reveal from '../ui/Reveal.jsx';

const CATEGORY_ICONS = {
  Frontend: 'fa-laptop-code',
  Backend: 'fa-server',
  Database: 'fa-database',
  Tools: 'fa-tools',
};

const Skills = () => {
  const { skills } = usePortfolio();
  const [expanded, setExpanded] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map();
    skills.forEach((skill) => {
      const category = skill.category || 'Other';
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(skill);
    });
    return Array.from(map.entries());
  }, [skills]);

  const visibleGroups = expanded ? grouped : grouped.slice(0, 3);

  if (!skills.length) return null;

  return (
    <section className="section section-dark" id="skills">
      <div className="container">
        <SectionHeader
          subtitle="MY EXPERTISE"
          title="My"
          highlight="Skills"
          icon="fa-code"
          light
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleGroups.map(([category, items], groupIndex) => (
            <Reveal key={category} delay={groupIndex * 90}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-5 flex items-center gap-3 text-lg font-semibold text-white">
                  <i className={`fas ${CATEGORY_ICONS[category] ?? 'fa-code'} text-primary-400`} />
                  {category}
                </h3>

                <div className="space-y-5">
                  {items.map((skill) => (
                    <div key={skill._id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-medium text-ink-100">
                          <i
                            className={`fab ${skill.icon}`}
                            style={{ color: skill.icon_color || '#93CCC5' }}
                          />
                          {skill.name}
                        </span>
                        <span className="text-xs font-semibold text-primary-300">
                          {skill.percentage}%
                        </span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-teal-gradient transition-[width] duration-1000 ease-out"
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <LoadMore
          total={grouped.length}
          limit={3}
          label="Load More Skills"
          onLoaded={() => setExpanded(true)}
        />
      </div>
    </section>
  );
};

export default Skills;
