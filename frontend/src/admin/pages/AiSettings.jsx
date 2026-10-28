import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDate } from '../../utils/format.js';

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

const AiSettings = () => {
  const { request } = useAdminAuth();
  const fileRef = useRef(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await request('/admin/ai-settings');
      setValues(data ?? {});
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the AI settings.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);

    try {
      const data = await request('/admin/ai-documents');
      setDocuments(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load training documents.');
    } finally {
      setDocsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
    loadDocuments();
  }, [load, loadDocuments]);

  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const uploadDocument = async (file) => {
    if (!file) return;

    setUploading(true);
    setError('');
    setNotice('');

    const body = new FormData();
    body.append('file', file);

    try {
      const result = await request('/admin/ai-documents', { method: 'POST', body });
      setNotice(
        result?.message ||
          'Training document uploaded successfully. It will be used for AI answers.',
      );
      if (fileRef.current) fileRef.current.value = '';
      await loadDocuments();
    } catch (uploadError) {
      setError(uploadError?.message || 'Unable to upload training document.');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async () => {
    if (!removing) return;

    setDeleting(true);
    setError('');

    try {
      await request(`/admin/ai-documents/${removing._id}`, { method: 'DELETE' });
      setRemoving(null);
      setNotice('Training document deleted successfully.');
      await loadDocuments();
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete training document.');
    } finally {
      setDeleting(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const body = { ...values };
    body.ai_enabled = Boolean(values.ai_enabled) && values.ai_enabled !== '0';

    try {
      await request('/admin/ai-settings', { method: 'PUT', body });
      setNotice('AI settings saved successfully.');
      await load();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save the AI settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
      </div>
    );
  }

  const keyConfigured = values.ejolabs_api_key_configured;
  const keySource = values.ejolabs_api_key_source;

  return (
    <form onSubmit={save}>
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-xl font-bold text-ink">
          <i className="fas fa-robot text-primary-500" /> AI assistant
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Configure the chat widget that answers questions about the portfolio.
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

      <div className="space-y-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-ink-400">
            Assistant
          </h2>

          <div className="mb-5 flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-600">Enable the chat widget</p>
              <p className="text-xs text-ink-400">
                Visitors can chat with the assistant when this is on.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={values.ai_enabled ? 'true' : 'false'}
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  ai_enabled: current.ai_enabled ? '0' : '1',
                }))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                values.ai_enabled ? 'bg-primary-500' : 'bg-ink-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  values.ai_enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-name">
                Assistant name
              </label>
              <input
                id="ai-name"
                type="text"
                value={values.ai_name ?? ''}
                onChange={update('ai_name')}
                className="field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-provider">
                Provider
              </label>
              <select
                id="ai-provider"
                value={values.fallback_provider ?? 'ejolabs'}
                onChange={update('fallback_provider')}
                className="field"
              >
                <option value="ejolabs">EJOLABS (EJoAI)</option>
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
                <option value="builtin">Built-in answers</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-greeting">
                Greeting message
              </label>
              <textarea
                id="ai-greeting"
                rows={2}
                value={values.ai_greeting ?? ''}
                onChange={update('ai_greeting')}
                className="field resize-y"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-prompt">
                System prompt
              </label>
              <textarea
                id="ai-prompt"
                rows={4}
                value={values.system_prompt ?? ''}
                onChange={update('system_prompt')}
                placeholder="Leave empty to use the default portfolio assistant prompt."
                className="field resize-y"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-ink-400">
            Model tuning
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-temp">
                Temperature
              </label>
              <input
                id="ai-temp"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={values.temperature ?? '0.7'}
                onChange={update('temperature')}
                className="field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-tokens">
                Max tokens
              </label>
              <input
                id="ai-tokens"
                type="number"
                min="1"
                max="8192"
                value={values.max_tokens ?? '2048'}
                onChange={update('max_tokens')}
                className="field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="ai-history">
                History length
              </label>
              <input
                id="ai-history"
                type="number"
                min="1"
                max="20"
                value={values.conversation_length ?? '10'}
                onChange={update('conversation_length')}
                className="field"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-400">
            API keys
          </h2>

          <p className="mb-5 text-sm text-ink-500">
            {keyConfigured
              ? `An EJOLABS key is configured (source: ${keySource}). The stored key is never shown again.`
              : 'No EJOLABS key is configured yet. Add one below to enable the AI answers.'}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="key-ejo">
                EJOLABS key
              </label>
              <input
                id="key-ejo"
                type="password"
                value={values.ejolabs_api_key ?? ''}
                onChange={update('ejolabs_api_key')}
                placeholder={keyConfigured ? '••••••••••' : 'Paste the key'}
                className="field"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="key-groq">
                Groq key
              </label>
              <input
                id="key-groq"
                type="password"
                value={values.groq_api_key ?? ''}
                onChange={update('groq_api_key')}
                placeholder="Optional"
                className="field"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="key-gemini">
                Gemini key
              </label>
              <input
                id="key-gemini"
                type="password"
                value={values.gemini_api_key ?? ''}
                onChange={update('gemini_api_key')}
                placeholder="Optional"
                className="field"
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <header className="mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
              Train the assistant with your documents
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Upload files about your life, background, or anything you want the AI to answer
              from. Supported formats: <span className="font-medium text-ink">CSV, PDF, DOC, DOCX, TXT</span>.
              Kinyarwanda text is read as-is.
            </p>
          </header>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[240px]">
              <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="training-file">
                Document file
              </label>
              <input
                id="training-file"
                ref={fileRef}
                type="file"
                accept=".csv,.pdf,.doc,.docx,.txt,text/plain,text/csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => uploadDocument(event.target.files?.[0])}
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
                  <i className="fas fa-cloud-arrow-up" /> Upload document
                </>
              )}
            </button>
          </div>

          <div className="mt-6">
            {docsLoading ? (
              <div className="flex justify-center py-10">
                <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
              </div>
            ) : documents.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-400">
                No training documents uploaded yet.
              </p>
            ) : (
              <ul className="divide-y divide-ink-50">
                {documents.map((row) => (
                  <li key={row._id} className="flex flex-wrap items-center gap-4 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <i className={`fas ${row.extension === 'pdf' ? 'fa-file-pdf' : row.extension === 'csv' ? 'fa-file-csv' : 'fa-file-lines'}`} />
                    </div>

                    <div className="min-w-[220px] flex-1">
                      <p className="text-sm font-medium text-ink">{row.title}</p>
                      <p className="text-xs text-ink-400">
                        {row.original_name} · {row.extension?.toUpperCase()} · {formatSize(row.size)} ·{' '}
                        {row.char_count?.toLocaleString() ?? 0} chars · {formatDate(row.created_at)}
                      </p>
                      {row.status === 'failed' ? (
                        <p className="mt-1 text-xs text-red-500">{row.error_message}</p>
                      ) : row.status === 'empty' ? (
                        <p className="mt-1 text-xs text-amber-600">{row.error_message}</p>
                      ) : null}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        row.status === 'ready'
                          ? 'bg-emerald-50 text-emerald-600'
                          : row.status === 'empty'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {row.status === 'ready' ? 'Ready' : row.status === 'empty' ? 'No text' : 'Failed'}
                    </span>

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
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Saving...
            </>
          ) : (
            <>
              <i className="fas fa-check" /> Save settings
            </>
          )}
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete training document?"
        message="This file and its extracted knowledge will be removed from the AI assistant."
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setRemoving(null)}
        onConfirm={removeDocument}
      />
    </form>
  );
};

export default AiSettings;
