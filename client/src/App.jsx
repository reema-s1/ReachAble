import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import JobListingsPage from './pages/JobListingsPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import JobDetailModal from './pages/JobDetailModal.jsx';
import ApplyPage from './pages/ApplyPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminJobFormPage from './pages/AdminJobFormPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <Routes location={background || location}>
            <Route path="/" element={<JobListingsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/:id/apply" element={<ApplyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminDashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/jobs/new"
              element={
                <RequireAuth>
                  <AdminJobFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/jobs/:id/edit"
              element={
                <RequireAuth>
                  <AdminJobFormPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        {background && (
          <Routes>
            <Route path="/jobs/:id" element={<JobDetailModal />} />
          </Routes>
        )}
      </ThemeProvider>
    </AuthProvider>
  );
}
