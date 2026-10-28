import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuth.jsx';
import { formatDate } from '../../utils/format.js';

const StatCard = ({ icon, label, value, tone = 'teal' }) => {
  const tones = {
    teal: 'bg-primary-50 text-primary-600',
    sand: 'bg-sand-100 text-sand-500',
    ink: 'bg-ink-50 text-ink-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          <i className={`fas ${icon} text-lg`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">{value ?? 0}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { request, user } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await request('/admin/dashboard');
      setData(payload);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" className="btn-outline btn-sm mt-4" onClick={load}>
          <i className="fas fa-rotate-right" /> Try again
        </button>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const recentMessages = data?.recentMessages ?? [];
  const recentVisitors = data?.recentVisitors ?? [];

  const cards = [
    { icon: 'fa-folder-open', label: 'Projects', value: stats.projects, tone: 'teal' },
    { icon: 'fa-code', label: 'Skills', value: stats.skills, tone: 'sand' },
    { icon: 'fa-blog', label: 'Blog posts', value: stats.blogs, tone: 'ink' },
    { icon: 'fa-envelope', label: 'Messages', value: stats.messages, tone: 'amber' },
    { icon: 'fa-envelope-open', label: 'Unread', value: stats.unreadMessages, tone: 'amber' },
    { icon: 'fa-briefcase', label: 'Experience', value: stats.experience, tone: 'teal' },
    { icon: 'fa-graduation-cap', label: 'Education', value: stats.education, tone: 'sand' },
    { icon: 'fa-certificate', label: 'Certificates', value: stats.certificates, tone: 'ink' },
    { icon: 'fa-cogs', label: 'Services', value: stats.services, tone: 'teal' },
    { icon: 'fa-comment-dots', label: 'Testimonials', value: stats.testimonials, tone: 'sand' },
    { icon: 'fa-trophy', label: 'Achievements', value: stats.achievements, tone: 'ink' },
    { icon: 'fa-eye', label: 'Visitors', value: stats.visitors, tone: 'teal' },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-400">
          Welcome back, {user?.full_name || user?.username || 'admin'}.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
              Recent messages
            </h2>
            <Link to="/admin/messages" className="text-xs font-medium text-primary-600 hover:underline">
              View all
            </Link>
          </header>

          {recentMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-ink-50">
              {recentMessages.map((message) => (
                <li key={message._id} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      message.is_read ? 'bg-ink-200' : 'bg-primary-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{message.subject}</p>
                    <p className="truncate text-xs text-ink-400">
                      {message.name} · {message.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-300">
                    {formatDate(message.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <header className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
              Recent visitors
            </h2>
          </header>

          {recentVisitors.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No traffic recorded yet.</p>
          ) : (
            <ul className="divide-y divide-ink-50">
              {recentVisitors.map((visitor, index) => (
                <li key={visitor._id ?? index} className="flex items-center gap-3 py-3">
                  <i className="fas fa-eye text-ink-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-600">
                      {visitor.page_url || 'Unknown page'}
                    </p>
                    <p className="truncate text-xs text-ink-400">{visitor.ip_address}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-300">
                    {formatDate(visitor.visited_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
