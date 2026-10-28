import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext.jsx';

/**
 * Navigation entries.
 * `/#section` links scroll to a home page section, the rest are real routes.
 */
const LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Services', href: '/#services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Education', href: '/education' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
];

const isHashLink = (href) => href.includes('#');

const Navbar = () => {
  const { profile } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const sections = LINKS.filter((link) => isHashLink(link.href))
      .map((link) => link.href.split('#')[1])
      .filter(Boolean);

    if (location.pathname !== '/') {
      setActive('');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const brand = profile.site_name || profile.owner_name || 'NIBISHAKA CEDRICK';

  // The brand is shown as a compact monogram instead of the full name.
  const monogram = brand
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  const renderLink = (link, className) => {
    const key = isHashLink(link.href) ? link.href.split('#')[1] : link.href;
    const isActive = isHashLink(link.href)
      ? location.pathname === '/' && active === key
      : location.pathname === link.href;

    if (isHashLink(link.href)) {
      return (
        <Link key={link.label} to={link.href} className={`${className} ${isActive ? 'active' : ''}`}>
          {link.label}
        </Link>
      );
    }

    return (
      <Link key={link.label} to={link.href} className={`${className} ${isActive ? 'active' : ''}`}>
        {link.label}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[9000] transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink-100 bg-white/90 shadow-soft backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container relative flex items-center justify-between py-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-ink" title={brand}>
          <span className="gradient-text">{monogram}</span>
        </Link>

        {/* Centered rounded navigation bar */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-ink-100 bg-white/85 p-1.5 shadow-soft backdrop-blur-md">
            {LINKS.map((link) => renderLink(link, 'nav-pill'))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:border-primary-500 hover:text-primary-600 sm:inline-flex"
            title="Admin"
          >
            <i className="fas fa-user-lock" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-600 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <i className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink-100 bg-white px-5 pb-5 pt-2 shadow-card lg:hidden">
          <div className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink-50 py-3 text-sm font-medium text-ink-600 last:border-0 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/admin/login"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink-500"
            >
              <i className="fas fa-user-lock" /> Admin
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
