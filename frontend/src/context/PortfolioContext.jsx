import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const PortfolioContext = createContext(null);

const ENDPOINTS = {
  profile: '/portfolio/profile',
  skills: '/portfolio/skills',
  services: '/portfolio/services',
  projects: '/portfolio/projects',
  experience: '/portfolio/experience',
  education: '/portfolio/education',
  certificates: '/portfolio/certificates',
  testimonials: '/portfolio/testimonials',
  achievements: '/portfolio/achievements',
  socialLinks: '/portfolio/social-links',
  blogs: '/portfolio/blogs',
  blogCategories: '/portfolio/blog-categories',
};

const LIST_SETTERS = {
  skills: 'setSkills',
  services: 'setServices',
  projects: 'setProjects',
  experience: 'setExperience',
  education: 'setEducation',
  certificates: 'setCertificates',
  testimonials: 'setTestimonials',
  achievements: 'setAchievements',
  socialLinks: 'setSocialLinks',
  blogs: 'setBlogs',
  blogCategories: 'setBlogCategories',
};

export const PortfolioProvider = ({ children }) => {
  const [profile, setProfile] = useState({});
  const [lists, setLists] = useState(() =>
    Object.keys(LIST_SETTERS).reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const keys = Object.keys(ENDPOINTS);
    const results = await Promise.allSettled(
      keys.map((key) => api.get(ENDPOINTS[key])),
    );

    const failures = [];
    const nextLists = { ...lists };

    results.forEach((result, index) => {
      const key = keys[index];

      if (result.status !== 'fulfilled') {
        failures.push(result.reason?.message ?? 'Request failed');
        return;
      }

      if (key === 'profile') {
        setProfile(result.value ?? {});
        return;
      }

      nextLists[key] = Array.isArray(result.value) ? result.value : [];
    });

    setLists(nextLists);

    if (failures.length > 0) setError(failures[0]);

    setLoading(false);
  }, [lists]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ...lists,
      loading,
      error,
      reload: load,
    }),
    [profile, lists, loading, error, load],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used inside a PortfolioProvider');
  return context;
};

export default PortfolioContext;
