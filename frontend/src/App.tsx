import { lazy, Suspense, useLayoutEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Members from './pages/Members';
import Projects from './pages/Projects';
import Podcasts from './pages/Podcasts';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Inductions from './pages/Inductions';
import DesktopIcons from './components/desktop/DesktopIcons';
import Taskbar from './components/desktop/Taskbar';
import BootIntro, { shouldPlayIntro } from './components/desktop/BootIntro';
import Contact from './pages/Contact';
import PhoneAppBar from './components/phone/PhoneAppBar';
import PhoneDock from './components/phone/PhoneDock';
import { useIsPhone } from './hooks/useIsPhone';

const Dashboard = lazy(() => import('./pages/Dashboard'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [isBooting, setIsBooting] = useState(shouldPlayIntro);
  const isPhone = useIsPhone();
  const { pathname } = useLocation();
  const isPhoneApp = isPhone && pathname !== '/';

  return (
    <div className={isPhone ? 'phone-ui' : undefined} data-phone-app={isPhoneApp || undefined}>
      <ScrollToTop />
      <a href="#main" className="skip-link">Skip to content</a>
      {isBooting && <BootIntro compact={isPhone} onDone={() => setIsBooting(false)} />}
      {isPhoneApp && <PhoneAppBar />}
      <div className="desk-shell">
        {!isPhone && <DesktopIcons />}
        <main id="main" className="desk-stage" tabIndex={-1}>
          <Suspense fallback={<p className="win win-body">Opening window…</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/inductions" element={<Inductions />} />
              <Route path="/waiting-list" element={<Inductions />} />
              <Route path="/inductions-waiting-list" element={<Inductions />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:idOrSlug" element={<EventDetail />} />
              <Route path="/members" element={<Members />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/contact" element={<Contact />} />
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
      </div>
      {isPhone ? <PhoneDock /> : <Taskbar />}
    </div>
  );
};

export default App;
