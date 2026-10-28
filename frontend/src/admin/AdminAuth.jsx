import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AdminAuthContext = createContext(null);

const TOKEN_KEY = 'cedrick-admin-token';
const USER_KEY = 'cedrick-admin-user';

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? '');
  const [user, setUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [checking, setChecking] = useState(Boolean(token));

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
    setChecking(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    const nextToken = data?.token ?? '';

    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data?.user ?? null));

    setToken(nextToken);
    setUser(data?.user ?? null);
    return data?.user ?? null;
  }, []);

  // Validates the stored token on boot so an expired session is cleared.
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return undefined;
    }

    let cancelled = false;

    api
      .get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const request = useCallback(
    (path, options = {}) =>
      api.request(path, {
        ...options,
        headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` },
      }),
    [token],
  );

  const value = useMemo(
    () => ({ token, user, checking, login, logout, request, isAuthenticated: Boolean(token) }),
    [token, user, checking, login, logout, request],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used inside an AdminAuthProvider');
  return context;
};

export default AdminAuthContext;
