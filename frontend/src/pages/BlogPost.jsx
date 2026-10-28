import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { assetUrl, formatDate } from '../utils/format.js';
import { PageLoader } from '../components/ui/ErrorState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get(`/portfolio/blogs/${slug}`);
      setPost(data);
    } catch (requestError) {
      setError(requestError?.message || 'This article could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white pt-28">
        <PageLoader label="Loading article..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container bg-white pt-28">
        <div className="py-16">
          <ErrorState message={error || 'This article could not be found.'} onRetry={load} />
          <div className="mt-8 text-center">
            <Link to="/blog" className="btn-outline">
              <i className="fas fa-arrow-left" /> Back to all posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white pt-28">
      <header className="container max-w-3xl pt-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
          {formatDate(post.published_date || post.createdAt)}
        </span>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-ink-400">
          By <span className="font-medium text-ink-600">{post.author}</span>
          {post.reading_time ? ` · ${post.reading_time} min read` : ''}
        </p>
      </header>

      {post.image ? (
        <div className="container mt-10 max-w-4xl">
          <img
            src={assetUrl(post.image)}
            alt={post.title}
            className="w-full rounded-2xl object-cover shadow-card"
          />
        </div>
      ) : null}

      <div className="container max-w-3xl py-12">
        <div className="space-y-5 text-base leading-relaxed text-ink-600">
          {String(post.content ?? '')
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, index) => (
              <p key={index}>{line}</p>
            ))}
        </div>

        <div className="mt-12 border-t border-ink-100 pt-8 text-center">
          <Link to="/blog" className="btn-outline">
            <i className="fas fa-arrow-left" /> Back to all posts
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
