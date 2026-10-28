import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { assetUrl, formatDate, truncate } from '../utils/format.js';
import { PageLoader } from '../components/ui/ErrorState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import Reveal from '../components/ui/Reveal.jsx';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [postData, categoryData] = await Promise.all([
        api.get('/portfolio/blogs'),
        api.get('/portfolio/blog-categories'),
      ]);
      setPosts(Array.isArray(postData) ? postData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load the blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return posts;
    return posts.filter((post) => post.category_id === activeCategory);
  }, [posts, activeCategory]);

  return (
    <div className="bg-white pt-0">
      <PageHero
        eyebrow="LATEST POSTS"
        title="My"
        highlight="Blog"
        icon="fa-blog"
        description="Articles and notes about modern web development, tooling and the lessons I picked up along the way."
        breadcrumbs={['Blog']}
      />

      <section className="section pt-16">
        <div className="container">
          {categories.length > 0 ? (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-teal-gradient text-white'
                    : 'border border-ink-200 text-ink-500 hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setActiveCategory(category._id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === category._id
                      ? 'bg-teal-gradient text-white'
                      : 'border border-ink-200 text-ink-500 hover:border-primary-500 hover:text-primary-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}

          {loading ? (
            <PageLoader label="Loading posts..." />
          ) : error ? (
            <div className="mt-10">
              <ErrorState message={error} onRetry={load} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="mt-10 text-center text-ink-400">No posts published yet.</p>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, index) => (
                <Reveal key={post._id} delay={index * 70}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover"
                  >
                    {post.image ? (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={assetUrl(post.image)}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-xs text-primary-600">
                        <i className="fas fa-calendar mr-2" />
                        {formatDate(post.published_date || post.createdAt)}
                      </span>

                      <h3 className="mt-3 text-lg font-semibold text-ink">{post.title}</h3>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                        {truncate(post.meta_description || post.content, 120)}
                      </p>

                      <span className="mt-5 text-sm font-medium text-primary-600">
                        Read More{' '}
                        <i className="fas fa-arrow-right ml-1 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
