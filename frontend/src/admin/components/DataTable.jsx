import { assetUrl } from '../../utils/format.js';

const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-ink-50 text-ink-500',
    teal: 'bg-primary-50 text-primary-600',
    sand: 'bg-sand-100 text-sand-500',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-500',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

/**
 * Renders a single cell value according to the column configuration.
 */
const Cell = ({ column, row }) => {
  const value = row[column.key];

  if (column.type === 'image') {
    if (!value) return <span className="text-ink-300">-</span>;
    return (
      <img
        src={assetUrl(value)}
        alt=""
        className="h-11 w-16 rounded-lg object-cover ring-1 ring-ink-100"
      />
    );
  }

  if (column.type === 'toggle') {
    return value ? <Badge tone="green">Yes</Badge> : <Badge tone="slate">No</Badge>;
  }

  if (column.type === 'date') {
    if (!value) return <span className="text-ink-300">-</span>;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return <span>{String(value)}</span>;
    return <span>{date.toLocaleDateString()}</span>;
  }

  if (column.type === 'status') {
    const tone =
      value === 'published' || value === 'completed'
        ? 'green'
        : value === 'draft' || value === 'planned'
          ? 'amber'
          : 'slate';
    return <Badge tone={tone}>{String(value ?? '-')}</Badge>;
  }

  if (column.type === 'link') {
    if (!value) return <span className="text-ink-300">-</span>;
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-primary-600 hover:underline"
      >
        <i className="fas fa-arrow-up-right-from-square" />
      </a>
    );
  }

  if (value === null || value === undefined || value === '') {
    return <span className="text-ink-300">-</span>;
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  return <span className="line-clamp-2">{String(value)}</span>;
};

const DataTable = ({ columns, rows, onEdit, onDelete, emptyMessage = 'No records yet.' }) => {
  if (!rows.length) {
    return <p className="py-12 text-center text-sm text-ink-400">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-400">
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-ink-50">
          {rows.map((row) => (
            <tr key={row._id} className="transition-colors hover:bg-primary-50/40">
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 ${index === 0 ? 'font-medium text-ink' : 'text-ink-500'}`}
                >
                  <Cell column={column} row={row} />
                </td>
              ))}

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit?.(row)}
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Edit"
                  >
                    <i className="fas fa-pen" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(row)}
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Badge, Cell };
export default DataTable;
