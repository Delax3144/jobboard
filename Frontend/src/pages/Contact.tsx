// src/pages/Contact.tsx
import { useContact } from "../hooks/useContact";

const Icons = {
  Email: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Chat: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
  ArrowRight: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>,
  Ticket: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function Contact() {
  const { user, view, setView, tickets, formData, status, setStatus, errorMsg, handleChange, handleSubmit } = useContact();

  const inputStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#fff',
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    outline: 'none',
    fontSize: '15px',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  };

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
      paddingBottom: '100px'
    }}>
      
      {/* Декоративные свечения на фоне */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* === ЗАГОЛОВОК === */}
        <div className="contact-hero" style={{ textAlign: 'center', marginBottom: '80px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Support Center
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 950, margin: '0 0 15px', letterSpacing: '-1.5px', color: '#fff' }}>
            {view === "form" ? (
              <>How can we <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>help you?</span></>
            ) : (
              <>Your <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Support Tickets</span></>
            )}
          </h1>
          <p style={{ color: '#888', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
            {view === "form" 
              ? "Have a question, feedback, or need help with your account? Our dedicated support team is here to assist you every step of the way."
              : "Review the status of your previous support requests and keep track of our conversations."}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', alignItems: 'stretch' }}>
          
          {/* === ЛЕВАЯ ЧАСТЬ: ИНФО И КНОПКА ТИКЕТОВ === */}
          <div className="contact-card" style={{ 
            background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', 
            padding: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column'
          }}>
            
            <div>
              <h3 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '15px', color: '#fff', letterSpacing: '-0.5px' }}>Contact Information</h3>
              <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '40px', fontSize: '15px' }}>
                Fill out the form and our technical support team will get back to you. We prioritize critical issues to keep your hiring process smooth.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Email />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email Us Direct</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>support@jobboard.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Clock />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Average Response Time</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>Under 24 hours</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Chat />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>General Inquiries</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>hello@jobboard.com</div>
                </div>
              </div>
            </div>
              
            {user && (
              <div style={{ marginTop: 'auto' }}>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }} />
                <button 
                  onClick={() => setView(view === "form" ? "tickets" : "form")}
                  style={{ 
                    width: '100%',
                    background: view === "tickets" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', 
                    border: view === "tickets" ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.08)', 
                    color: view === "tickets" ? '#10b981' : '#fff', 
                    padding: '18px 20px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight: 700, fontSize: '15px', transition: 'all 0.2s' 
                  }}
                  onMouseOver={e => { if(view === "form") e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseOut={e => { if(view === "form") e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  {view === "form" ? <><Icons.Ticket /> View My Tickets</> : <><Icons.ArrowLeft /> Back to Form</>}
                </button>
              </div>
            )}
          </div>

          {/* === ПРАВАЯ ЧАСТЬ: ДИНАМИЧЕСКИЙ КОНТЕНТ (ФОРМА ИЛИ СПИСОК ТИКЕТОВ) === */}
          <div className="contact-card" style={{ 
            background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', 
            padding: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column'
          }}>
            
            {view === "form" ? (
              status === "success" ? (
                <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.4s ease-out', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Icons.Check />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '15px', letterSpacing: '-0.5px' }}>Message Sent!</h3>
                  <p style={{ color: '#888', lineHeight: '1.6', fontSize: '16px', marginBottom: '40px' }}>
                    Thank you for reaching out. A ticket has been created and our support team will get back to your email shortly.
                  </p>
                  <button 
                    onClick={() => { setStatus("typing"); if(user) setView("tickets"); }} 
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 32px', borderRadius: '16px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', marginTop: 'auto' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    {user ? "View My Tickets" : "Send another message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', flex: 1, animation: 'fadeIn 0.3s ease-out' }}>
                  
                  {status === "error" && (
                    <div style={{ background: 'rgba(255,75,75,0.05)', color: '#ff4b4b', padding: '16px', borderRadius: '16px', fontSize: '14px', border: '1px solid rgba(255,75,75,0.2)', fontWeight: 600, textAlign: 'center' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Full Name *</label>
                      <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="John Doe" onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="john@example.com" onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Subject</label>
                    <input name="subject" value={formData.subject} onChange={handleChange} style={inputStyle} placeholder="How can we help?" onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Message *</label>
                    <textarea required name="message" value={formData.message} onChange={handleChange} style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' }} placeholder="Please describe your issue in detail..." onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === "sending"} 
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', 
                      padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, 
                      marginTop: 'auto', border: 'none', cursor: status === "sending" ? 'not-allowed' : 'pointer', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s',
                      opacity: status === "sending" ? 0.7 : 1
                    }}
                    onMouseOver={e => { if(status !== "sending") e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={e => { if(status !== "sending") e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {status === "sending" ? "Sending Request..." : <>Submit Request <Icons.ArrowRight /></>}
                  </button>
                </form>
              )
            ) : (
              <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons.Ticket /> Open Requests
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '10px' }}>
                  {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                      <Icons.Chat />
                      <p style={{ marginTop: '15px', fontSize: '15px' }}>You haven't sent any support tickets yet.</p>
                    </div>
                  ) : (
                    tickets.map(t => (
                      <div key={t.id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '25px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <span style={{ fontSize: '13px', color: '#888', fontWeight: 700, fontFamily: 'monospace' }}>Ticket #{t.id.slice(0, 8).toUpperCase()}</span>
                          <span style={{ 
                            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 10px', borderRadius: '8px',
                            background: t.status === 'Resolved' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            color: t.status === 'Resolved' ? '#3b82f6' : '#10b981',
                            border: t.status === 'Resolved' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            {t.status}
                          </span>
                        </div>
                        
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '10px' }}>{t.subject || "General Inquiry"}</div>
                        <div style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                          {t.message.length > 150 ? t.message.slice(0, 150) + "..." : t.message}
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#555', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icons.Clock /> Submitted on {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}