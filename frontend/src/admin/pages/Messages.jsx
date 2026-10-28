import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';
import { formatDate } from '../../utils/format.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const Messages = () => {
  const { request } = useAdminAuth();
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const data = await request(`/admin/messages${query}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the messages.');
    } finally {
      setLoading(false);
    }
  }, [filter, request]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (message) => {
    setActive(message);
    try {
      const full = await request(`/admin/messages/${message._id}`);
      setActive(full);
      setMessages((current) =>
        current.map((item) => (item._id === full._id ? { ...item, is_read: 1 } : item)),
      );
    } catch {
      /* keep the list row when the detail call fails */
    }
  };

  const remove = async () => {
    if (!removing) return;

    setDeleting(true);

    try {
      await request(`/admin/messages/${removing._id}`, { method: 'DELETE' });
      setRemoving(null);
      if (active?._id === removing._id) setActive(null);
      await load();
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete the message.');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
  ];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-ink">
            <i className="fas fa-envelope text-primary-500" /> Messages
          </h1>
          <p className="mt-1 text-sm text-ink-400">{messages.length} messages</p>
        </div>

        <div className="flex gap-1 rounded-full border border-ink-100 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-teal-gradient text-white'
                  : 'text-ink-500 hover:text-primary-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-6 lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-400">No messages found.</p>
          ) : (
            <ul className="divide-y divide-ink-50">
              {messages.map((message) => (
                <li key={message._id}>
                  <button
                    type="button"
                    onClick={() => open(message)}
                    className={`w-full py-3 text-left transition-colors ${
                      active?._id === message._id ? 'border-l-2 border-primary-500 pl-3' : 'pl-0'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-ink">
                        {message.subject}
                      </p>
                      {!message.is_read ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-400">
                      {message.name} · {message.email}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-300">
                      {message.message}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-300">
                      {formatDate(message.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6 lg:col-span-3">
          {!active ? (
            <p className="py-16 text-center text-sm text-ink-400">
              Select a message to read it.
            </p>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{active.subject}</h2>
                  <p className="mt-1 text-xs text-ink-400">
                    From <span className="font-medium text-ink-600">{active.name}</span> ·{' '}
                    <a href={`mailto:${active.email}`} className="text-primary-600 hover:underline">
                      {active.email}
                    </a>
                    {active.phone ? ` · ${active.phone}` : ''}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-300">
                    {formatDate(active.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRemoving(active)}
                  className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>

              <p className="mt-6 whitespace-pre-wrap rounded-xl bg-ink-50/60 p-5 text-sm leading-relaxed text-ink-600">
                {active.message}
              </p>

              <a
                href={`mailto:${active.email}?subject=${encodeURIComponent(`Re: ${active.subject}`)}`}
                className="btn-primary btn-sm mt-6"
              >
                <i className="fas fa-reply" /> Reply
              </a>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete message?"
        message="This message will be permanently removed."
        busy={deleting}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default Messages;
