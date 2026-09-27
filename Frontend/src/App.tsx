import styles from "./App.module.css";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import Home from "./pages/Home/Home";
const Jobs = lazy(() => import('./pages/Jobs/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails/JobDetails'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Applications = lazy(() => import('./pages/Applications/Applications'));
const Employer = lazy(() => import('./pages/Employer/Employer'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails/ApplicationDetails'));
const MessagesPage = lazy(() => import('./pages/MessagesPage/MessagesPage'));
const JobManagement = lazy(() => import('./pages/JobManagement/JobManagement'));
const SavedJobs = lazy(() => import('./pages/SavedJobs/SavedJobs'));
const AboutUs = lazy(() => import('./pages/AboutUs/AboutUs'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const PublicProfile = lazy(() => import('./pages/PublicProfile/PublicProfile'));
const Legal = lazy(() => import('./pages/Legal/Legal'));
const Blog = lazy(() => import('./pages/Blog/Blog'));

import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingChatButton from "./components/FloatingChatButton";

import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className={`container ${styles.authLoading}`}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({ mode }: { mode: UserMode }) {
  const location = useLocation();

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
      <Suspense fallback={<div className={styles.routeLoading}>Loading...</div>}>
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
          <div className={styles.canvas}>
            <AppRoutes mode={mode} />
          </div>
          <Footer />
          <FloatingChatButton />

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              className: styles.toast,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
