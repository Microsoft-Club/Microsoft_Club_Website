import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Members from './pages/Members';
import Projects from './pages/Projects';
import Podcasts from './pages/Podcasts';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Inductions from './pages/Inductions';

const Dashboard = lazy(() => import('./pages/Dashboard'));

const App = () => {
  return (
    <div className="min-h-screen retro-app-bg font-body text-black flex flex-col">
      <Navbar />
      <main className="flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-8 md:py-10 max-w-6xl mx-auto w-full">
        <Suspense fallback={<p className="text-sm">Loading page...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inductions" element={<Inductions />} />
            <Route path="/waiting-list" element={<Inductions />} />
            <Route path="/inductions-waiting-list" element={<Inductions />} />
            <Route path="/events" element={<Events />} />

            <Route path="/members" element={<Members />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;

