import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuth.jsx';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: 'fa-gauge-high', end: true }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: 'fa-folder-open' },
      { to: '/admin/skills', label: 'Skills', icon: 'fa-code' },
      { to: '/admin/services', label: 'Services', icon: 'fa-cogs' },
      { to: '/admin/experience', label: 'Experience', icon: 'fa-briefcase' },
      { to: '/admin/education', label: 'Education', icon: 'fa-graduation-cap' },
      { to: '/admin/certificates', label: 'Certificates', icon: 'fa-certificate' },
      { to: '/admin/testimonials', label: 'Testimonials', icon: 'fa-comment-dots' },
      { to: '/admin/achievements', label: 'Achievements', icon: 'fa-trophy' },
      { to: '/admin/social-links', label: 'Social links', icon: 'fa-share-nodes' },
    ],
  },
  {
    label: 'Blog',
    items: [
      { to: '/admin/blogs', label: 'Posts', icon: 'fa-blog' },
      { to: '/admin/blog-categories', label: 'Categories', icon: 'fa-tags' },
    ],
  },
  {
    label: 'Inbox & files',
    items: [
      { to: '/admin/messages', label: 'Messages', icon: 'fa-envelope' },
      { to: '/admin/resume', label: 'Resume / CV', icon: 'fa-file-pdf' },
      { to: '/admin/uploads', label: 'Uploads', icon: 'fa-cloud-arrow-up' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/admin/site-info', label: 'Site information', icon: 'fa-sliders' },
      { to: '/admin/ai-settings', label: 'AI assistant', icon: 'fa-robot' },
    ],
  },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const sidebar = (
    <nav className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-3 px-6 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-gradient text-white">
          <i className="fas fa-user-lock" />
        </span>
        <span>
          <span className="block text-sm font-bold text-ink">Admin panel</span>
          <span className="block text-xs text-ink-400">Cedrick portfolio</span>
        </span>
      </Link>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-300">
              {group.label}
            </p>

            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-ink-500 hover:bg-ink-50 hover:text-ink'
                      }`
                    }
                  >
                    <i className={`fas ${item.icon} w-4 text-center`} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {(user?.full_name || user?.username || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user?.full_name || user?.username || 'Admin'}
            </p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Sign out"
          >
            <i className="fas fa-right-from-bracket" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-50/60">
      <aside className="fixed inset-y-0 left-0 z-[9500] hidden w-64 border-r border-ink-100 bg-white lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[9600] lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-[9000] flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-50"
            aria-label="Open navigation"
          >
            <i className="fas fa-bars" />
          </button>
          <span className="text-sm font-bold text-ink">Admin panel</span>
          <a
            href="/"
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-50"
            title="View the site"
          >
            <i className="fas fa-arrow-up-right-from-square" />
          </a>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
