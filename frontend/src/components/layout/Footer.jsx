import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext.jsx';

const Footer = () => {
  const { profile, socialLinks } = usePortfolio();

  const brand = profile.footer_copyright || profile.site_name || 'NIBISHAKA CEDRICK';
  const email = profile.footer_email || profile.owner_email || 'cedrickrwa@gmail.com';
  const phone = profile.footer_phone || profile.owner_phone || '+250791801839';
  const address = profile.footer_address || profile.owner_location || 'Kigali, Rwanda';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-ink-200">
      <div className="container py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="gradient-text text-lg font-bold">NIBISHAKA CEDRICK</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              Full Stack Developer passionate about creating innovative web solutions.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-300">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/#home" className="transition-colors hover:text-primary-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#about" className="transition-colors hover:text-primary-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/projects" className="transition-colors hover:text-primary-300">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/education" className="transition-colors hover:text-primary-300">
                  Education
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-primary-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="transition-colors hover:text-primary-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-300">
              Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/#services" className="transition-colors hover:text-primary-300">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/#services" className="transition-colors hover:text-primary-300">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/#services" className="transition-colors hover:text-primary-300">
                  API Development
                </Link>
              </li>
              <li>
                <Link to="/#services" className="transition-colors hover:text-primary-300">
                  Database Design
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-300">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <i className="fas fa-envelope mt-1 text-primary-400" />
                <a href={`mailto:${email}`} className="transition-colors hover:text-primary-300">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-phone mt-1 text-primary-400" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="transition-colors hover:text-primary-300">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-map-marker-alt mt-1 text-primary-400" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        {socialLinks.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-ink-400">
          <p>
            &copy; {year} {brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
