import { usePortfolio } from '../context/PortfolioContext.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Hero from '../components/sections/Hero.jsx';
import About from '../components/sections/About.jsx';
import Skills from '../components/sections/Skills.jsx';
import Services from '../components/sections/Services.jsx';
import Experience from '../components/sections/Experience.jsx';
import Testimonials from '../components/sections/Testimonials.jsx';
import Achievements from '../components/sections/Achievements.jsx';
import Certificates from '../components/sections/Certificates.jsx';
import Explore from '../components/sections/Explore.jsx';
import Contact from '../components/sections/Contact.jsx';

const Home = () => {
  const { loading, error, reload } = usePortfolio();

  if (error && !loading) {
    return (
      <div className="container pt-32">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Services />
      <Experience />
      <Testimonials />
      <Achievements />
      <Certificates />
      <Explore />
      <Contact />
    </>
  );
};

export default Home;
