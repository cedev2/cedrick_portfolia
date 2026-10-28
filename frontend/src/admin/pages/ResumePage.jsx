import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';
import { formatDate } from '../../utils/format.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const formatSize = (bytes) => {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const ResumePage = () => {
  const { request } = useAdminAuth();
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('Resume');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await request('/admin/resume');
      setRows(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the CV files.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError('');
    setNotice('');

    const body = new FormData();
    body.append('cv_file', file);
    body.append('title', title.trim() || 'Resume');

    try {
      await request('/admin/resume', { method: 'POST', body });
      setNotice('CV uploaded and activated successfully.');
      setTitle('Resume');
      if (fileRef.current) fileRef.current.value = '';
      await load();
    } catch (uploadError) {
      setError(uploadError?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const activate = async (row) => {
    setError('');

    try {
      await request(`/admin/resume/${row._id}/activate`, { method: 'PATCH' });
      setNotice('CV activated.');
      await load();
    } catch (activateError) {
      setError(activateError?.message || 'Unable to activate the CV.');
    }
  };

  const remove = async () => {
    if (!removing) return;

    setDeleting(true);

    try {
      await request(`/admin/resume/${removing._id}`, { method: 'DELETE' });
      setRemoving(null);
      await load();
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete the CV.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-xl font-bold text-ink">
          <i className="fas fa-file-pdf text-primary-500" /> Resume / CV
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          The active CV is linked to the "Download CV" button on the public site.
        </p>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}
      {notice ? (
        <p className="mb-4 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
          {notice}
        </p>
      ) : null}

      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-400">
          Upload a new CV
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="cv-title">
              Title
            </label>
            <input
              id="cv-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field"
              placeholder="Curriculum Vitae (CV)"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="cv-file">
              PDF file
            </label>
            <input
              id="cv-file"
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={(event) => upload(event.target.files?.[0])}
              disabled={uploading}
              className="field text-xs"
            />
          </div>

          <button type="button" className="btn-primary btn-sm" disabled={uploading}>
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-arrow-up" /> Upload
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-400">No CV uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-ink-50">
            {rows.map((row) => (
              <li key={row._id} className="flex flex-wrap items-center gap-4 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <i className="fas fa-file-pdf" />
                </div>

                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-medium text-ink">{row.title}</p>
                  <p className="text-xs text-ink-400">
                    {formatSize(row.file_size)} · {row.download_count ?? 0} downloads ·{' '}
                    {formatDate(row.createdAt)}
                  </p>
                </div>

                {row.is_active ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => activate(row)}
                    className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-600 hover:bg-primary-100"
                  >
                    Activate
                  </button>
                )}

                <a
                  href={`/api/download/resume/${row._id}`}
                  className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  title="Download"
                >
                  <i className="fas fa-download" />
                </a>

                <button
                  type="button"
                  onClick={() => setRemoving(row)}
                  className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete CV?"
        message="The file will be removed from the server as well."
        busy={deleting}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default ResumePage;
