import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';

const GROUPS = [
  {
    title: 'Hero',
    icon: 'fa-star',
    fields: [
      { name: 'hero_greeting', label: 'Greeting', type: 'text' },
      { name: 'hero_title', label: 'Title', type: 'text' },
      { name: 'hero_description', label: 'Description', type: 'textarea', full: true },
      { name: 'hero_image', label: 'Hero image path', type: 'text' },
      { name: 'about_image', label: 'About image path', type: 'text' },
      {
        name: 'typing_texts',
        label: 'Typing texts',
        type: 'text',
        full: true,
        hint: 'JSON array, e.g. ["Software Developer","Full Stack Developer"]',
      },
    ],
  },
  {
    title: 'Owner',
    icon: 'fa-user',
    fields: [
      { name: 'owner_name', label: 'Full name', type: 'text' },
      { name: 'owner_email', label: 'Email', type: 'text' },
      { name: 'owner_phone', label: 'Phone', type: 'text' },
      { name: 'owner_location', label: 'Location', type: 'text' },
      { name: 'owner_languages', label: 'Languages', type: 'text' },
      { name: 'owner_experience_years', label: 'Years of experience', type: 'text' },
      { name: 'owner_bio', label: 'Bio', type: 'textarea', full: true },
      { name: 'owner_story', label: 'Story', type: 'textarea', full: true },
      { name: 'owner_hobbies', label: 'Hobbies', type: 'textarea', full: true },
      { name: 'owner_goals', label: 'Goals', type: 'textarea', full: true },
      { name: 'owner_fun_facts', label: 'Fun facts', type: 'textarea', full: true },
    ],
  },
  {
    title: 'Site & footer',
    icon: 'fa-globe',
    fields: [
      { name: 'site_name', label: 'Site name', type: 'text' },
      { name: 'site_title', label: 'Browser title', type: 'text' },
      { name: 'site_description', label: 'Meta description', type: 'textarea', full: true },
      { name: 'footer_email', label: 'Footer email', type: 'text' },
      { name: 'footer_phone', label: 'Footer phone', type: 'text' },
      { name: 'footer_address', label: 'Footer address', type: 'text' },
      { name: 'footer_copyright', label: 'Copyright name', type: 'text' },
    ],
  },
  {
    title: 'Pricing & availability',
    icon: 'fa-tags',
    fields: [
      { name: 'pricing_info', label: 'Pricing info', type: 'textarea', full: true },
      { name: 'pricing_min', label: 'Starting price', type: 'text' },
      { name: 'pricing_payment', label: 'Payment methods', type: 'text' },
      { name: 'pricing_note', label: 'Pricing note', type: 'text' },
      {
        name: 'availability_status',
        label: 'Availability',
        type: 'select',
        options: ['available', 'busy', 'unavailable'],
        placeholder: 'Select a status',
      },
    ],
  },
];

// Only the fields rendered by the form are submitted, so a save can never
// clear a value that the form does not even display.
const FORM_FIELDS = GROUPS.flatMap((group) => group.fields.map((field) => field.name));


const SiteInfo = () => {
  const { request } = useAdminAuth();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await request('/admin/site-info');
      setValues(data ?? {});
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the site information.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const payload = FORM_FIELDS.reduce((acc, field) => {
      acc[field] = values[field] ?? '';
      return acc;
    }, {});

    try {
      await request('/admin/site-info', { method: 'PUT', body: payload });
      setNotice('Site information saved successfully.');
      await load();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save the site information.');
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

  return (
    <form onSubmit={save}>
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-xl font-bold text-ink">
          <i className="fas fa-sliders text-primary-500" /> Site information
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          These values drive the hero, the about section and the AI assistant answers.
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
        {GROUPS.map((group) => (
          <section key={group.title} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-400">
              <i className={`fas ${group.icon} text-primary-500`} /> {group.title}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div key={field.name} className={field.full ? 'sm:col-span-2' : undefined}>
                  <label
                    className="mb-2 block text-sm font-medium text-ink-600"
                    htmlFor={`site-${field.name}`}
                  >
                    {field.label}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={`site-${field.name}`}
                      rows={3}
                      value={values[field.name] ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      className="field resize-y"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`site-${field.name}`}
                      value={values[field.name] ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      className="field"
                    >
                      {field.placeholder ? <option value="">{field.placeholder}</option> : null}
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`site-${field.name}`}
                      type="text"
                      value={values[field.name] ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      className="field"
                    />
                  )}

                  {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Saving...
            </>
          ) : (
            <>
              <i className="fas fa-check" /> Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SiteInfo;
