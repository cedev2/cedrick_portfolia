import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';
import DataTable from '../components/DataTable.jsx';
import Field from '../components/Field.jsx';
import FormModal from '../components/FormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const emptyForm = (fields) =>
  fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'toggle' ? 0 : field.type === 'list' ? [] : '';
    return acc;
  }, {});

/**
 * A configuration driven CRUD screen.
 *
 * Every collection in the admin area follows the same
 * list -> create -> update -> delete flow, so the individual screens are
 * described by a config object instead of duplicated component code.
 */
const ResourcePage = ({ config }) => {
  const { request } = useAdminAuth();
  const { endpoint, label, columns, fields, title, icon } = config;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(fields));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [optionCache, setOptionCache] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const query = term ? `?search=${encodeURIComponent(term)}` : '';
      const data = await request(`${endpoint}${query}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the records.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, term, request]);

  useEffect(() => {
    load();
  }, [load]);

  /* Loads the option lists used by the select fields. */
  useEffect(() => {
    const sources = fields
      .filter((field) => field.optionsFrom)
      .map((field) => field.optionsFrom);

    const unique = Array.from(new Set(sources));

    unique.forEach(async (source) => {
      if (optionCache[source]) return;

      try {
        const data = await request(source);
        setOptionCache((current) => ({ ...current, [source]: Array.isArray(data) ? data : [] }));
      } catch {
        setOptionCache((current) => ({ ...current, [source]: [] }));
      }
    });
  }, [fields, optionCache, request]);

  const optionsByField = useMemo(() => {
    const result = {};

    fields.forEach((field) => {
      if (!field.optionsFrom) return;

      const source = optionCache[field.optionsFrom] ?? [];
      result[field.name] = source.map((item) => ({
        value: item[field.optionValue ?? '_id'],
        label: item[field.optionLabel ?? 'name'],
      }));
    });

    return result;
  }, [fields, optionCache]);

  const openCreate = () => {
    setForm(emptyForm(fields));
    setFormError('');
    setEditing('new');
  };

  const openEdit = (row) => {
    const next = emptyForm(fields);

    fields.forEach((field) => {
      const value = row[field.name];
      if (value === undefined || value === null) return;
      next[field.name] = field.type === 'list' && !Array.isArray(value) ? String(value) : value;
    });

    setForm(next);
    setFormError('');
    setEditing(row);
  };

  const save = async () => {
    setSaving(true);
    setFormError('');

    try {
      if (editing === 'new') {
        await request(endpoint, { method: 'POST', body: form });
      } else {
        await request(`${endpoint}/${editing._id}`, { method: 'PUT', body: form });
      }

      setEditing(null);
      await load();
    } catch (saveError) {
      setFormError(saveError?.message || 'Unable to save the record.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!removing) return;

    setDeleting(true);

    try {
      await request(`${endpoint}/${removing._id}`, { method: 'DELETE' });
      setRemoving(null);
      await load();
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete the record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-ink">
            {icon ? <i className={`fas ${icon} text-primary-500`} /> : null}
            {title ?? label}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setTerm(search.trim());
            }}
            className="relative"
          >
            <i className="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={config.searchPlaceholder ?? 'Search...'}
              className="field w-56 pl-9"
            />
          </form>

          <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
            <i className="fas fa-plus" /> Add {label}
          </button>
        </div>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            onEdit={openEdit}
            onDelete={setRemoving}
            emptyMessage={`No ${label.toLowerCase()} records yet.`}
          />
        )}
      </div>

      <FormModal
        open={Boolean(editing)}
        title={editing === 'new' ? `Add ${label}` : `Edit ${label}`}
        onClose={() => setEditing(null)}
        onSubmit={save}
        busy={saving}
        error={formError}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.full ? 'sm:col-span-2' : undefined}>
              <Field
                field={field}
                value={form[field.name]}
                options={optionsByField[field.name] ?? []}
                onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}
              />
            </div>
          ))}
        </div>
      </FormModal>

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Delete ${label}?`}
        message="This record will be removed from the portfolio. This action cannot be undone."
        busy={deleting}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default ResourcePage;
