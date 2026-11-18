import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteProvider, useSite } from './lib/SiteContext.jsx';
import { DemoProvider } from './components/DemoModal.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import { BlogIndex, BlogPost } from './pages/Blog.jsx';
import NotFound from './pages/NotFound.jsx';

// The admin dashboard is only downloaded when someone visits /admin.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function ResumeRedirect() {
  const { resumeUrl } = useSite();
  window.location.replace(resumeUrl);
  return null;
}

export default function App() {
  return (
    <SiteProvider>
      <DemoProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<p className="admin-loading">Loading dashboard…</p>}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Old multi-page URLs now live as sections of the home page */}
            <Route path="/projects" element={<Navigate to="/#all-projects" replace />} />
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="/contact" element={<Navigate to="/#contact" replace />} />
            <Route path="/resume" element={<ResumeRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </DemoProvider>
    </SiteProvider>
  );
}
