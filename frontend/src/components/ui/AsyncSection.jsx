import { Link } from 'react-router-dom';
import ErrorState from './ErrorState.jsx';
import { PageLoader } from './ErrorState.jsx';

/**
 * Renders the loader, the error or the content depending on the request state.
 */
const AsyncSection = ({ loading, error, onRetry, children, label = 'Loading...' }) => {
  if (loading) return <PageLoader label={label} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  return children;
};

export const NotFoundBlock = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
    <i className="fas fa-folder-open text-4xl text-primary-300" />
    <p className="text-ink-500">There is nothing here yet.</p>
    <Link to="/" className="btn-outline">
      <i className="fas fa-house" /> Back home
    </Link>
  </div>
);

export default AsyncSection;
