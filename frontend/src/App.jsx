import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.jsx';
import Preloader from './components/layout/Preloader.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import BackToTop from './components/layout/BackToTop.jsx';
import ChatWidget from './components/chat/ChatWidget.jsx';
import AdminApp from './admin/AdminApp.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import Education from './pages/Education.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import NotFound from './pages/NotFound.jsx';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let attempts = 0;

      const scrollToHash = () => {
        const node = document.getElementById(id);
        if (node) {
          node.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        attempts += 1;
        if (attempts < 20) window.setTimeout(scrollToHash, 50);
      };

      scrollToHash();
      return undefined;
    }

    window.scrollTo({ top: 0 });
    return undefined;
  }, [pathname, hash]);

  return null;
};

const PublicSite = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <div key={pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      <Footer />
      <BackToTop />
      <ChatWidget />
    </div>
  );
};

const App = () => (
  <PortfolioProvider>
    <Preloader />
    <ScrollToTop />
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />

      <Route element={<PublicSite />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/education" element={<Education />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </PortfolioProvider>
);

export default App;
