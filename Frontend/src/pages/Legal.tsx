import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const Icons = {
  Shield: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  FileText: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Cookie: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 11h.01M11 15h.01M15 15h.01M12 5a3 3 0 00-3 3 3 3 0 003 3m-3-3v.01" /></svg>,
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function Legal() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Определяем активную вкладку на основе URL
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "cookies">("privacy");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.pathname.includes("terms")) setActiveTab("terms");
    else if (location.pathname.includes("cookies")) setActiveTab("cookies");
    else setActiveTab("privacy");
  }, [location.pathname]);

  const TABS = [
    { id: "privacy", label: "Privacy Policy", icon: <Icons.Shield />, path: "/privacy" },
    { id: "terms", label: "Terms of Service", icon: <Icons.FileText />, path: "/terms" },
    { id: "cookies", label: "Cookie Settings", icon: <Icons.Cookie />, path: "/cookies" },
  ];

  return (
    <div style={{ 
      background: '#050505', 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: 'calc(100vh - 80px)', 
      overflowX: 'clip',
      paddingBottom: '80px'
    }}>
      
      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '0', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 0 }}>
          <Icons.ArrowLeft /> Go Back
        </button>

        <div style={{ marginBottom: '50px' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', color: '#888', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(255, 255, 255, 0.1)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Legal Center
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 950, margin: '0 0 15px', letterSpacing: '-1.5px', color: '#fff' }}>
            Commitment to <span style={{ color: '#10b981' }}>Transparency</span>
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
            We believe in clear, honest, and secure practices. Read our policies below to understand how we protect your data and operate JobBoard.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* === НАВИГАЦИЯ СЛЕВА === */}
          <div style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TABS.map(tab => (
                  <Link 
                    key={tab.id} 
                    to={tab.path}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', 
                      background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent', 
                      color: activeTab === tab.id ? '#10b981' : '#888', 
                      border: '1px solid', borderColor: activeTab === tab.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent', 
                      borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === tab.id ? 700 : 600, 
                      transition: 'all 0.2s', textDecoration: 'none'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </Link>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '30px', padding: '0 15px', color: '#555', fontSize: '13px', lineHeight: '1.6' }}>
              Last updated: <strong>May 2026</strong><br/>
              Have questions? <Link to="/contact" style={{ color: '#10b981', textDecoration: 'none' }}>Contact Support</Link>
            </div>
          </div>

          {/* === КОНТЕНТ СПРАВА === */}
          <div style={{ flex: 1, minWidth: '300px', background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
            
            <style>{`
              .legal-content h2 { color: #fff; font-size: 24px; font-weight: 800; margin: 40px 0 15px; letter-spacing: -0.5px; }
              .legal-content h2:first-child { margin-top: 0; }
              .legal-content p { color: #aaa; font-size: 16px; line-height: 1.8; margin-bottom: 20px; }
              .legal-content ul { color: #aaa; font-size: 16px; line-height: 1.8; margin-bottom: 20px; padding-left: 20px; }
              .legal-content li { margin-bottom: 10px; }
              .legal-content strong { color: #ddd; }
            `}</style>

            <div className="legal-content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              
              {/* --- PRIVACY POLICY --- */}
              {activeTab === "privacy" && (
                <>
                  <h2>1. Information We Collect</h2>
                  <p>When you use JobBoard, we collect information that you provide directly to us, such as when you create an account, update your profile, apply for a job, or communicate with us. This may include your <strong>name, email address, phone number, resume/CV, and professional experience</strong>.</p>
                  <p>We also automatically collect certain information about your device and how you interact with our platform, including IP addresses, browser types, and usage data to improve our services.</p>

                  <h2>2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Provide, maintain, and improve the JobBoard platform.</li>
                    <li>Connect candidates with potential employers securely.</li>
                    <li>Send you technical notices, updates, security alerts, and support messages.</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                  </ul>

                  <h2>3. Data Sharing and Privacy</h2>
                  <p>We <strong>do not sell</strong> your personal data. We share your information only in the following circumstances:</p>
                  <ul>
                    <li><strong>With Employers:</strong> When you apply for a job, your profile and CV are shared with that specific employer.</li>
                    <li><strong>With Service Providers:</strong> We use third-party vendors (like AWS or Vercel) for hosting and infrastructure, under strict confidentiality agreements.</li>
                    <li><strong>Legal Requirements:</strong> If required by law or legal process.</li>
                  </ul>

                  <h2>4. Your GDPR & CCPA Rights</h2>
                  <p>Depending on your location, you have the right to access, correct, delete, or port your personal data. You can manage your data directly from your <Link to="/profile" style={{ color: '#10b981', textDecoration: 'none' }}>Profile Settings</Link>. For complete data deletion, contact our privacy team.</p>
                </>
              )}

              {/* --- TERMS OF SERVICE --- */}
              {activeTab === "terms" && (
                <>
                  <h2>1. Acceptance of Terms</h2>
                  <p>By accessing or using the JobBoard platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the website or use any services.</p>

                  <h2>2. User Accounts & Security</h2>
                  <p>You are responsible for safeguarding your account login credentials. We highly recommend enabling <strong>Two-Factor Authentication (2FA)</strong> in your security settings. You must immediately notify us of any unauthorized use of your account.</p>

                  <h2>3. Platform Rules for Candidates</h2>
                  <p>As a candidate, you agree to:</p>
                  <ul>
                    <li>Provide accurate, current, and complete information in your profile and resume.</li>
                    <li>Not use the platform for any unlawful purpose.</li>
                    <li>Respect the communication channels and not spam employers.</li>
                  </ul>

                  <h2>4. Platform Rules for Employers</h2>
                  <p>As an employer or recruiter, you agree to:</p>
                  <ul>
                    <li>Post legitimate, accurate job listings with clear salary ranges where applicable.</li>
                    <li>Treat candidate data with strict confidentiality and not use it outside the scope of recruitment.</li>
                    <li>Not discriminate based on race, gender, religion, or any other protected status.</li>
                  </ul>

                  <h2>5. Termination</h2>
                  <p>We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the platform.</p>
                </>
              )}

              {/* --- COOKIE SETTINGS --- */}
              {activeTab === "cookies" && (
                <>
                  <h2>1. What Are Cookies?</h2>
                  <p>Cookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie. This data often consists of a string of numbers and letters that uniquely identifies your computer.</p>

                  <h2>2. How We Use Cookies</h2>
                  <p>JobBoard uses cookies and similar technologies to:</p>
                  <ul>
                    <li><strong>Strictly Necessary:</strong> Keep you logged in, securely process your job applications, and remember your security preferences (like 2FA status).</li>
                    <li><strong>Performance & Analytics:</strong> Understand how users interact with our platform so we can improve the UI/UX. We use privacy-friendly analytics tools.</li>
                    <li><strong>Preferences:</strong> Remember your theme choice (dark/light) and search filters.</li>
                  </ul>

                  <h2>3. Manage Your Preferences</h2>
                  <p>We believe in putting you in control. While strictly necessary cookies cannot be disabled (as the platform would break), you can opt-out of analytics tracking.</p>
                  
                  <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
                      <div>
                        <strong style={{ color: '#fff', display: 'block', fontSize: '15px' }}>Essential Cookies</strong>
                        <span style={{ color: '#666', fontSize: '13px' }}>Required for the site to function.</span>
                      </div>
                      <div style={{ background: '#111', color: '#666', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>Always Active</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#fff', display: 'block', fontSize: '15px' }}>Analytics & Performance</strong>
                        <span style={{ color: '#666', fontSize: '13px' }}>Help us improve the platform.</span>
                      </div>
                      <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: '#10b981', position: 'relative', cursor: 'pointer' }}>
                         <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: '23px' }} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}