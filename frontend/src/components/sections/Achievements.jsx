import { usePortfolio } from '../../context/PortfolioContext.jsx';
import useCountUp from '../../hooks/useCountUp.js';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';

const AchievementCard = ({ achievement, index }) => {
  const { ref, value } = useCountUp(achievement.count ?? 0);

  return (
    <div className="card text-center">
      <i className={`fas ${achievement.icon || 'fa-trophy'} text-3xl text-primary-500`} />
      <span ref={ref} className="mt-4 block text-4xl font-extrabold text-white">
        {value}
      </span>
      <p className="mt-2 text-sm text-ink-300">{achievement.title}</p>
      <span className="sr-only">{index}</span>
    </div>
  );
};

const Achievements = () => {
  const { achievements } = usePortfolio();

  if (!achievements.length) return null;

  return (
    <section className="section section-dark" id="achievements">
      <div className="container">
        <SectionHeader
          subtitle="MY ACHIEVEMENTS"
          title="Achievements &"
          highlight="Awards"
          icon="fa-trophy"
          light
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement, index) => (
            <Reveal key={achievement._id} delay={index * 80}>
              <AchievementCard achievement={achievement} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
