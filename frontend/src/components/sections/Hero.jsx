import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import useTypingEffect from '../../hooks/useTypingEffect.js';
import { assetUrl, parseTypingTexts } from '../../utils/format.js';

const FLOATING_ICONS = ['fab fa-react', 'fab fa-node-js', 'fab fa-php', 'fab fa-js'];

const Hero = () => {
  const { profile, socialLinks } = usePortfolio();

  const typingTexts = useMemo(() => parseTypingTexts(profile.typing_texts), [profile.typing_texts]);
  const typedText = useTypingEffect(typingTexts);

  const heroTitle = profile.hero_title || profile.owner_name || 'NIBISHAKA CEDRICK';
  const heroGreeting = profile.hero_greeting || "Hello, I'm";
  const heroDescription =
    profile.hero_description ||
    'I design and build modern, scalable web applications.';
  const heroImage = assetUrl(profile.hero_image || '/images/171354.png');
  const cvUrl = profile.cv_url || profile.resume_url || '';

  return (
    <section className="relative overflow-hidden bg-primary-50 pt-32 sm:pt-36" id="home">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-sand-200/50 blur-3xl" />

      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">
              {heroGreeting}
            </p>

            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              {heroTitle}
            </h1>

            <h2 className="mt-3 text-xl font-medium text-ink-600 sm:text-2xl">
              I'm a{' '}
              <span className="gradient-text font-semibold">{typedText}</span>
              <span className="ml-0.5 inline-block animate-pulse text-primary-500">|</span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-500">
              {heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {cvUrl ? (
                <a href={cvUrl} className="btn-primary" download>
                  <i className="fas fa-download" /> Download CV
                </a>
              ) : null}
              <Link to="/projects" className="btn-outline">
                <i className="fas fa-folder-open" /> View Projects
              </Link>
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link._id ?? link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon"
                    title={link.platform}
                  >
                    <i className={`fab ${link.icon}`} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up">
            <div className="relative aspect-square">
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary-300/70" />
              <div className="absolute inset-10 rounded-full border border-sand-300/70" />

              <div className="absolute inset-0 overflow-hidden rounded-full bg-white shadow-card">
                <img
                  src={heroImage}
                  alt="NIBISHAKA CEDRICK"
                  className="h-full w-full object-cover"
                />
              </div>

              {FLOATING_ICONS.map((icon, index) => (
                <span
                  key={icon}
                  className="absolute flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-white text-xl text-primary-500 shadow-card"
                  style={{
                    animationDelay: `${index * 0.6}s`,
                    top: `${8 + index * 22}%`,
                    left: index % 2 === 0 ? '-4%' : 'auto',
                    right: index % 2 === 0 ? 'auto' : '-4%',
                  }}
                >
                  <i className={icon} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
