import { useState } from 'react';

/**
 * Image with a graceful fallback.
 * When the file cannot be loaded the placeholder below is rendered instead of
 * a broken image icon.
 */
const SmartImage = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  fallbackIcon = 'fa-image',
  loading,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-primary-50 text-3xl text-primary-300 ${fallbackClassName}`}
        aria-hidden="true"
      >
        <i className={`fas ${fallbackIcon}`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? ''}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export default SmartImage;
