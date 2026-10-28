import { usePortfolio } from '../../context/PortfolioContext.jsx';
import useCountUp from '../../hooks/useCountUp.js';
import { assetUrl } from '../../utils/format.js';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';

const Stat = ({ value, label }) => {
  const { ref, value: current } = useCountUp(value);
  return (
    <div className="text-center">
      <span ref={ref} className="block text-3xl font-bold text-ink">
        {current}
        {label === 'Technologies' ? '+' : ''}
      </span>
      <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-ink-400">
        {label}
      </span>
    </div>
  );
};

const About = () => {
  const { profile, projects, skills, education } = usePortfolio();

  const aboutImage = assetUrl(profile.about_image || '/images/171377.png');
  const years = profile.owner_experience_years || '3+';
  const topEducation = education?.[0]?.title || 'Computer Science';
  const location = profile.owner_location || 'Kigali, Rwanda';
  const languages = profile.owner_languages || 'English, Kinyarwanda';

  const info = [
    { icon: 'fa-graduation-cap', label: 'Education', value: topEducation },
    { icon: 'fa-briefcase', label: 'Experience', value: `${years} Years` },
    { icon: 'fa-map-marker-alt', label: 'Location', value: location },
    { icon: 'fa-language', label: 'Languages', value: languages },
  ];

  return (
    <section className="section bg-white" id="about">
      <div className="container">
        <SectionHeader
          subtitle="GET TO KNOW ME"
          title="About"
          highlight="Me"
          icon="fa-user"
          tag="Full Stack Developer"
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={aboutImage} alt="About Me" className="w-full object-cover" />
            </div>

            <div className="absolute -bottom-5 -right-3 flex flex-col items-center rounded-2xl bg-teal-gradient px-6 py-4 text-white shadow-card">
              <span className="text-2xl font-bold">{years}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider">Years Experience</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 sm:grid-cols-2">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-primary-50/60 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
                >
                  <i className={`fas ${item.icon} mt-1 text-lg text-primary-500`} />
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{item.label}</h4>
                    <p className="text-sm text-ink-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
              <Stat value={projects.length} label="Projects" />
              <Stat value={skills.length} label="Skills" />
              <Stat value={50} label="Technologies" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;
