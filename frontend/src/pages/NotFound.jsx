import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-white px-5 text-center">
    <span className="gradient-text text-7xl font-extrabold">404</span>

    <div>
      <h1 className="text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">
        The page you are looking for does not exist or has been moved.
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-3">
      <Link to="/" className="btn-primary">
        <i className="fas fa-house" /> Back home
      </Link>
      <Link to="/blog" className="btn-outline">
        <i className="fas fa-blog" /> Read the blog
      </Link>
    </div>
  </div>
);

export default NotFound;
