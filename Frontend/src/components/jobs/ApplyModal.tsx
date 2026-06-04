// src/components/jobs/ApplyModal.tsx
import { createPortal } from "react-dom";
import ApplyForm from "../ApplyForm";

const Icons = {
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function ApplyModal({ isOpen, onClose, isSent, setIsSent, job }: any) {
  if (!isOpen || !document.body) return null;

  return createPortal(
    <div className="premium-scroll" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, display: 'flex', flexDirection: 'column', padding: '40px 20px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.3s ease-out' }} />
      
      <div className="job-apply-modal-inner" style={{ margin: 'auto', flexShrink: 0, position: 'relative', zIndex: 1, width: '100%', maxWidth: '600px', background: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', animation: 'slideUp 0.3s ease-out' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 10 }} onMouseOver={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'}} onMouseOut={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#888'}}>
          <Icons.Close />
        </button>

        {isSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Icons.Check />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '15px', letterSpacing: '-1px' }}>Application Sent!</h2>
            <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
              Your profile and cover letter have been sent to <strong>{job.companyName}</strong>. You can track the status in your Candidate Dashboard.
            </p>
            <button onClick={onClose} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 40px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
              Awesome, thanks!
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', paddingRight: '40px' }}>Submit Application</h2>
            <p style={{ color: '#888', margin: '0 0 25px', fontSize: '14px' }}>Applying for <strong style={{color: '#fff'}}>{job.title}</strong> at {job.companyName}</p>
            <ApplyForm jobId={job.id} jobTitle={job.title} onSuccess={() => setIsSent(true)} />
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}