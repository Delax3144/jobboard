// src/App.tsx
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

// Импорт страниц
import Home from "./pages/Home/Home";
const Jobs = lazy(() => import('./pages/Jobs/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails/JobDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Applications = lazy(() => import('./pages/Applications'));
const Employer = lazy(() => import('./pages/Employer'));
const Profile = lazy(() => import('./pages/Profile'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const JobManagement = lazy(() => import('./pages/JobManagement'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));
const AboutUs = lazy(() => import('./pages/AboutUs/AboutUs'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Legal = lazy(() => import('./pages/Legal'));
const Blog = lazy(() => import('./pages/Blog/Blog'));

// Импорт компонентов
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingChatButton from "./components/FloatingChatButton";

// Либы
import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="container" style={{ color: '#fff', padding: '100px 0' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({ mode }: { mode: UserMode }) {
  const location = useLocation();

  // Логика определения полноэкранных страниц
  const fullWidthPaths = [
    "/", "/profile", "/blog", "/jobs", "/employer", "/login", "/register",
    "/privacy", "/terms", "/cookies", "/about", "/contact", "/applications",
    "/saved", "/forgot-password", "/reset-password"
  ];

  const isFullWidth =
    fullWidthPaths.includes(location.pathname) ||
    ["/messages", "/applications", "/jobs", "/candidate"].some(prefix => location.pathname.startsWith(prefix));

  return (
    <main className={isFullWidth ? "" : "container"}>
      <Suspense fallback={<div style={{ color: "#fff", padding: "80px", textAlign: "center" }}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
        <Route path="/applications/:id" element={<PrivateRoute><ApplicationDetails /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/messages/:id" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        {mode === "employer" && <Route path="/employer" element={<PrivateRoute><Employer /></PrivateRoute>} />}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employer/job/:id" element={<JobManagement />} />
        <Route path="/saved" element={<SavedJobs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/candidate/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/cookies" element={<Legal />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState<UserMode>(() => loadUserMode());

  useEffect(() => {
    saveUserMode(mode);
  }, [mode]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <TopNav mode={mode} setMode={setMode} />
          <div className="grid-canvas" style={{ minHeight: '80vh', position: 'relative' }}>
            <AppRoutes mode={mode} />
          </div>
          <Footer />
          <FloatingChatButton />

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(15, 15, 15, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
