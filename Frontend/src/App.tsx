import { BrowserRouter, Route, Routes, useLocation, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast'; // <-- Добавили Toaster
import api from "./lib/api";

// Импорт страниц
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Employer from "./pages/Employer";
import EmployerJob from "./pages/EmployerJob";
import Profile from './pages/Profile'; 
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ApplicationDetails from './pages/ApplicationDetails';
import MessagesPage from './pages/MessagesPage';
import JobManagement from './pages/JobManagement';
import SavedJobs from "./pages/SavedJobs";
import AboutUs from "./pages/AboutUs";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import PublicProfile from './pages/PublicProfile';
import Legal from './pages/Legal';
import Blog from './pages/Blog';

// Импорт компонентов
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

// Либы
import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode";

// === КНОПКА ЧАТА ===
function FloatingChatButton() {
  const { user } = useAuth();
  const location = useLocation();
  const [hasNewMsg, setHasNewMsg] = useState(false);

  useEffect(() => {
    if (!user || location.pathname.startsWith("/messages")) {
      setHasNewMsg(false);
      return;
    }

    const checkUpdates = () => {
      const endpoint = user.role === 'employer' ? '/applications/owner' : '/applications/my';
      api.get(endpoint).then((res) => {
        const unread = res.data.some((app: any) => {
          const lastUpdate = app.messages?.[0]?.createdAt || app.createdAt;
          const lastViewed = user.role === 'employer' ? app.lastViewedByOwner : app.lastViewedByCandidate;
          return lastUpdate > lastViewed || (user.role === 'candidate' && app.status === 'invited' && lastUpdate > lastViewed);
        });
        setHasNewMsg(unread);
      }).catch(() => {});
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 10000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  if (!user || location.pathname.startsWith("/messages")) return null;

  return (
    <Link 
      to="/messages" 
      className={`floating-chat-btn ${hasNewMsg ? 'has-notification' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <svg width="26" height="26" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: '-2px', marginTop: '2px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      
      {hasNewMsg && (
        <div 
          className="chat-notification-badge" 
          style={{ 
            width: '14px', height: '14px', top: '2px', right: '2px', 
            fontSize: 0, border: '2px solid #050505' 
          }} 
        />
      )}
    </Link>
  );
}

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="container" style={{ color: '#fff', padding: '100px 0' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({ mode }: { mode: UserMode }) {
  const location = useLocation();
  
  const fullWidthPages = ["/", "/profile", "/blog",
     "/jobs", "/employer", "/login", "/register",
      "/privacy", "/terms", "/cookies", "/about",
       "/contact", "/applications", "/saved"];
       
  const isFullWidth = 
  fullWidthPages.includes(location.pathname) || 
  location.pathname.startsWith("/messages") || 
  location.pathname.startsWith("/applications") ||
  location.pathname.startsWith("/jobs"); 

  return (
    <main className={isFullWidth ? "" : "container"}>
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
        <Route path="*" element={<NotFound />} />
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
      </Routes>
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
          <TopNav mode={mode} setMode={setMode} />
          <div className="grid-canvas" style={{ minHeight: '80vh', position: 'relative' }}>
            <AppRoutes mode={mode} />
          </div>
          <Footer />
          <FloatingChatButton />
          
          {/* === ГЛОБАЛЬНЫЕ УВЕДОМЛЕНИЯ === */}
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