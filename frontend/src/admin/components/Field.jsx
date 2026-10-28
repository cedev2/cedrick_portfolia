import ImageUpload from './ImageUpload.jsx';

const Label = ({ field }) => (
  <label className="block text-sm font-medium text-ink-600" htmlFor={`field-${field.name}`}>
    {field.label}
    {field.required ? <span className="ml-1 text-red-400">*</span> : null}
  </label>
);

/**
 * Renders a single form control based on the field definition.
 */
const Field = ({ field, value, onChange, options = [] }) => {
  const id = `field-${field.name}`;

  if (field.type === 'image') {
    return (
      <div>
        <Label field={field} />
        <div className="mt-2">
          <ImageUpload
            value={value ?? ''}
            folder={field.folder ?? 'projects'}
            label={field.label}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3">
        <div>
          <span className="block text-sm font-medium text-ink-600">{field.label}</span>
          {field.hint ? <span className="text-xs text-ink-400">{field.hint}</span> : null}
        </div>

        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={value ? 'true' : 'false'}
          onClick={() => onChange(value ? 0 : 1)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            value ? 'bg-primary-500' : 'bg-ink-200'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              value ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <Label field={field} />
        <select
          id={id}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="field mt-2"
        >
          {field.placeholder ? <option value="">{field.placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
        {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <Label field={field} />
        <textarea
          id={id}
          rows={field.rows ?? 4}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="field mt-2 resize-y"
        />
        {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div>
        <Label field={field} />
        <input
          id={id}
          type="number"
          value={value ?? ''}
          min={field.min}
          max={field.max}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="field mt-2"
        />
        {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div>
        <Label field={field} />
        <input
          id={id}
          type="date"
          value={value ? String(value).slice(0, 10) : ''}
          onChange={(event) => onChange(event.target.value)}
          className="field mt-2"
        />
        {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === 'list') {
    const text = Array.isArray(value) ? value.join(', ') : value ?? '';
    return (
      <div>
        <Label field={field} />
        <input
          id={id}
          type="text"
          value={text}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          placeholder={field.placeholder ?? 'One item per comma'}
          className="field mt-2"
        />
        {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <Label field={field} />
      <input
        id={id}
        type={field.type === 'url' ? 'url' : 'text'}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="field mt-2"
      />
      {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
    </div>
  );
};

export default Field;
