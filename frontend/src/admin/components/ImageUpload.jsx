import { useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';
import { assetUrl } from '../../utils/format.js';

/**
 * Uploads a file through the admin upload endpoints and returns its public path.
 */
const ImageUpload = ({ value, onChange, folder = 'projects', accept = 'image/*', label = 'Image' }) => {
  const { request } = useAdminAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value ?? '');

  useEffect(() => {
    setPreview(value ?? '');
  }, [value]);

  const upload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError('');

    const body = new FormData();
    body.append('image', file);
    body.append('folder', folder);

    try {
      const data = await request('/admin/upload/image', { method: 'POST', body });
      const path = data?.path ?? '';
      setPreview(path);
      onChange?.(path);
    } catch (uploadError) {
      setError(uploadError?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink-600">{label}</span>

      <div className="flex items-start gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
          {preview ? (
            <img src={assetUrl(preview)} alt="" className="h-full w-full object-cover" />
          ) : (
            <i className="fas fa-image text-2xl text-ink-300" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => upload(event.target.files?.[0])}
          />

          <button
            type="button"
            className="btn-outline btn-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-arrow-up" /> Upload
              </>
            )}
          </button>

          {preview ? (
            <button
              type="button"
              className="text-xs text-red-500 hover:underline"
              onClick={() => {
                setPreview('');
                onChange?.('');
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <input
        type="text"
        value={value ?? ''}
        onChange={(event) => {
          setPreview(event.target.value);
          onChange?.(event.target.value);
        }}
        placeholder="/uploads/... or https://..."
        className="field mt-3 text-xs"
      />

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

export default ImageUpload;
