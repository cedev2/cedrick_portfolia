import { useEffect } from 'react';

const ConfirmDialog = ({ open, title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel?.();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <i className="fas fa-triangle-exclamation" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            {message ? <p className="mt-1 text-sm text-ink-500">{message}</p> : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-trash" />}{' '}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
