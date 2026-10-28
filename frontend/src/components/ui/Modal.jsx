import { useEffect } from 'react';

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
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
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`relative max-h-[90vh] w-full ${maxWidth} overflow-y-auto scrollbar-thin rounded-2xl bg-white p-6 shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink"
          aria-label="Close"
        >
          <i className="fas fa-xmark text-lg" />
        </button>

        {title ? <h3 className="mb-4 pr-10 text-xl font-bold text-ink">{title}</h3> : null}

        {children}
      </div>
    </div>
  );
};

export default Modal;
