import Spinner from './Spinner.jsx';

const ErrorState = ({ message = 'Something went wrong while loading the content.', onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-16 text-center">
    <i className="fas fa-triangle-exclamation text-3xl text-sand-500" />
    <p className="max-w-md text-sm text-ink-500">{message}</p>
    {onRetry ? (
      <button type="button" className="btn-outline" onClick={onRetry}>
        <i className="fas fa-rotate-right" /> Try again
      </button>
    ) : null}
  </div>
);

export const PageLoader = ({ label = 'Loading...' }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner label={label} />
  </div>
);

export default ErrorState;
