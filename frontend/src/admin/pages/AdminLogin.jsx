import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuth.jsx';

const AdminLogin = () => {
  const { login, isAuthenticated, checking } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // An already signed in visitor never needs the form again.
  useEffect(() => {
    if (!checking && isAuthenticated) navigate('/admin', { replace: true });
  }, [checking, isAuthenticated, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(loginError?.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-50 px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-gradient text-white shadow-card">
            <i className="fas fa-user-lock text-xl" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink">Admin dashboard</h1>
          <p className="mt-1 text-sm text-ink-400">
            NIBISHAKA CEDRICK portfolio manager
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoFocus
              autoComplete="username"
              className="field"
              placeholder="admin"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-ink-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="field"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <i className="fas fa-circle-exclamation" /> {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary mt-6 w-full" disabled={busy}>
            {busy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-right-to-bracket" /> Sign in
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          <a href="/" className="transition-colors hover:text-primary-600">
            <i className="fas fa-arrow-left" /> Back to the portfolio
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
