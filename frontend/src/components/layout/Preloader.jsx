import { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { assetUrl } from '../../utils/format.js';

const MIN_DURATION = 900;

/**
 * Full-screen loading screen shown on the first paint / refresh.
 * The avatar sits inside a circle whose border is an animated sweeping line.
 */
const Preloader = () => {
  const { profile, loading } = usePortfolio();
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (loading || hidden) return undefined;

    let active = true;

    const minimum = new Promise((resolve) => {
      window.setTimeout(resolve, MIN_DURATION);
    });

    const pageLoaded = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
        return;
      }
      window.addEventListener('load', resolve, { once: true });
    });

    Promise.all([minimum, pageLoaded]).then(() => {
      if (!active) return;
      setHidden(true);
      window.setTimeout(() => setGone(true), 650);
    });

    return () => {
      active = false;
    };
  }, [loading, hidden]);

  useEffect(() => {
    const failsafe = window.setTimeout(() => {
      setHidden(true);
      window.setTimeout(() => setGone(true), 650);
    }, 8000);

    return () => window.clearTimeout(failsafe);
  }, []);

  useEffect(() => {
    if (gone) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  if (gone) return null;

  const image = assetUrl(profile.hero_image || '/images/171354.png');
  const name = profile.site_name || profile.owner_name || 'NIBISHAKA CEDRICK';

  return (
    <div
      className={`preloader ${hidden ? 'preloader-hidden' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="preloader-ring">
        <span className="preloader-ring-track" />
        <span className="preloader-ring-inner" />
        <span className="preloader-avatar">
          <img
            src={image}
            alt={name}
            onError={(event) => {
              event.currentTarget.src = '/images/171354.png';
            }}
          />
        </span>
      </div>

      <div className="preloader-caption">
        <p className="preloader-name">{name}</p>
        <p className="preloader-text">
          Loading
          <span className="preloader-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Preloader;
