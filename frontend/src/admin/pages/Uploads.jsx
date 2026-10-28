import { useRef, useState } from 'react';
import { useAdminAuth } from '../AdminAuth.jsx';
import { assetUrl } from '../../utils/format.js';

const Uploads = () => {
  const { request } = useAdminAuth();
  const imageRef = useRef(null);
  const documentRef = useRef(null);

  const [folder, setFolder] = useState('projects');
  const [imageBusy, setImageBusy] = useState(false);
  const [documentBusy, setDocumentBusy] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const uploadImage = async (file) => {
    if (!file) return;

    setImageBusy(true);
    setError('');

    const body = new FormData();
    body.append('image', file);
    body.append('folder', folder);

    try {
      const data = await request('/admin/upload/image', { method: 'POST', body });
      setResults((current) => [{ ...data, kind: 'image' }, ...current]);
    } catch (uploadError) {
      setError(uploadError?.message || 'The image upload failed.');
    } finally {
      setImageBusy(false);
      if (imageRef.current) imageRef.current.value = '';
    }
  };

  const uploadDocument = async (file) => {
    if (!file) return;

    setDocumentBusy(true);
    setError('');

    const body = new FormData();
    body.append('file', file);

    try {
      const data = await request('/admin/upload/document', { method: 'POST', body });
      setResults((current) => [{ ...data, kind: 'document' }, ...current]);
    } catch (uploadError) {
      setError(uploadError?.message || 'The document upload failed.');
    } finally {
      setDocumentBusy(false);
      if (documentRef.current) documentRef.current.value = '';
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-xl font-bold text-ink">
          <i className="fas fa-cloud-arrow-up text-primary-500" /> Uploads
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Upload images and PDF documents, then copy the returned path into the content.
        </p>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-ink-400">
            Image
          </h2>

          <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="upload-folder">
            Target folder
          </label>
          <select
            id="upload-folder"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="field"
          >
            {[
              'projects',
              'certificates',
              'certificate-images',
              'profile',
              'blog',
              'experience',
              'education',
              'testimonials',
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            ref={imageRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => uploadImage(event.target.files?.[0])}
            className="field mt-4 text-xs"
          />

          <button
            type="button"
            className="btn-primary btn-sm mt-4"
            disabled={imageBusy}
            onClick={() => uploadImage(imageRef.current?.files?.[0])}
          >
            {imageBusy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-arrow-up" /> Upload image
              </>
            )}
          </button>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-ink-400">
            Document (PDF)
          </h2>

          <input
            ref={documentRef}
            type="file"
            accept="application/pdf"
            onChange={(event) => uploadDocument(event.target.files?.[0])}
            className="field text-xs"
          />

          <button
            type="button"
            className="btn-primary btn-sm mt-4"
            disabled={documentBusy}
            onClick={() => uploadDocument(documentRef.current?.files?.[0])}
          >
            {documentBusy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-arrow-up" /> Upload document
              </>
            )}
          </button>
        </section>
      </div>

      {results.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-400">
            Recent uploads
          </h2>

          <ul className="divide-y divide-ink-50">
            {results.map((item, index) => (
              <li key={`${item.path}-${index}`} className="flex items-center gap-4 py-3">
                {item.kind === 'image' ? (
                  <img
                    src={assetUrl(item.path)}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-ink-100"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <i className="fas fa-file-pdf" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.original_name}</p>
                  <p className="truncate text-xs text-ink-400">{item.path}</p>
                </div>

                <button
                  type="button"
                  className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  title="Copy path"
                  onClick={() => navigator.clipboard?.writeText(item.path)}
                >
                  <i className="fas fa-copy" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default Uploads;
