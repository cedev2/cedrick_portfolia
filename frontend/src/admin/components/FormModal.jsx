import { useEffect } from 'react';

const FormModal = ({ open, title, onClose, onSubmit, busy, error, children, size = 'max-w-2xl' }) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        className={`my-8 w-full ${size} rounded-2xl bg-white p-6 shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink"
            aria-label="Close"
          >
            <i className="fas fa-xmark" />
          </button>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="space-y-4">{children}</div>

        <div className="mt-6 flex justify-end gap-3 border-t border-ink-100 pt-5">
          <button type="button" className="btn-ghost btn-sm" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary btn-sm" disabled={busy}>
            {busy ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check" />}{' '}
            {busy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormModal;
