import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './AdminAuth.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Messages from './pages/Messages.jsx';
import ResumePage from './pages/ResumePage.jsx';
import SiteInfo from './pages/SiteInfo.jsx';
import AiSettings from './pages/AiSettings.jsx';
import Uploads from './pages/Uploads.jsx';
import ResourcePage from './pages/ResourcePage.jsx';
import resources from './config/resources.js';

const Protected = ({ children }) => {
  const { isAuthenticated, checking } = useAdminAuth();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50/60">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return <AdminLayout>{children}</AdminLayout>;
};

const guard = (element) => <Protected>{element}</Protected>;

const AdminApp = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="login" element={<AdminLogin />} />

      <Route index element={guard(<Dashboard />)} />

      {Object.entries(resources).map(([key, config]) => (
        <Route key={key} path={key} element={guard(<ResourcePage config={config} />)} />
      ))}

      <Route path="messages" element={guard(<Messages />)} />
      <Route path="resume" element={guard(<ResumePage />)} />
      <Route path="uploads" element={guard(<Uploads />)} />
      <Route path="site-info" element={guard(<SiteInfo />)} />
      <Route path="ai-settings" element={guard(<AiSettings />)} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </AdminAuthProvider>
);

export default AdminApp;
