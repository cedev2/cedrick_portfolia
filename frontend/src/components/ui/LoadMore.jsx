import { useState } from 'react';

/**
 * "Load More" button used by the skills, services and experience sections.
 * `limit` controls how many items are visible before the button is pressed.
 */
const LoadMore = ({ total, limit, label = 'Load More', onLoaded }) => {
  const [expanded, setExpanded] = useState(false);

  if (total <= limit) return null;

  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        className="btn-outline"
        disabled={expanded}
        onClick={() => {
          setExpanded(true);
          onLoaded?.();
        }}
      >
        {expanded ? (
          <>
            <i className="fas fa-check" /> All Items Shown
          </>
        ) : (
          <>
            <i className="fas fa-plus" /> {label}
          </>
        )}
      </button>
    </div>
  );
};

export default LoadMore;
