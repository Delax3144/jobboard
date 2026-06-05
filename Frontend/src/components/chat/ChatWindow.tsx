// src/components/chat/ChatWindow.tsx
import { Link, useNavigate } from "react-router-dom";

const Icons = {
  Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Lock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  ArrowLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
};

export default function ChatWindow({ currentApp, isCurrentLockedForCandidate, user, apiUrl, msg, setMsg, sendMsg, scrollContainerRef, checkIsOnline }: any) {
  const navigate = useNavigate();

  if (!currentApp) {
    return (
      <div className="msg-chat-window" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#555' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#111', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Icons.Search /></div>
          <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '10px', letterSpacing: '-0.5px' }}>Your Messages</h3>
          <p style={{ fontSize: '15px', color: '#888' }}>Select a conversation from the left to start chatting</p>
        </div>
      </div>
    );
  }

  const partnerName = user?.role === 'employer' ? `${currentApp.candidate?.firstName || ''} ${currentApp.candidate?.lastName || ''}`.trim() || currentApp.candidate?.email : currentApp.job.companyName;
  const partnerLink = user?.role === 'employer' ? `/candidate/${currentApp.candidate.id}` : `/employer/company/${currentApp.job.ownerId}`;
  const partnerAvatar = user?.role === 'employer' ? currentApp.candidate?.avatarUrl : currentApp.job?.companyLogo;
  const isOnline = checkIsOnline(user?.role === 'employer' ? currentApp.candidate?.lastActive : currentApp.job?.owner?.lastActive);

  return (
    <div className="msg-chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(5, 5, 5, 0.4)', minWidth: 0, position: 'relative' }}>
      {/* HEADER */}
      <div className="msg-chat-header" style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <button className="msg-back-to-list-btn" onClick={() => navigate('/messages')} style={{ display: 'none', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '12px' }}>
            <Icons.ArrowLeft />
          </button>

          <div style={{ width: '48px', height: '48px', borderRadius: user?.role === 'employer' ? '50%' : '12px', background: '#111', border: '1px solid #222', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '18px' }}>
            {partnerAvatar ? <img src={partnerAvatar?.startsWith('http') ? partnerAvatar : `${apiUrl}${partnerAvatar}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span>{partnerName[0].toUpperCase()}</span>}
          </div>
          <div>
            <Link to={partnerLink} style={{ fontWeight: '800', fontSize: '18px', color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#10b981'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>
              {partnerName}
            </Link>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, background: isOnline ? '#10b981' : '#444', borderRadius: '50%' }} /> {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <div className="msg-chat-header-job-badge" style={{ background: '#111', border: '1px solid #222', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Context</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{currentApp.job.title}</span>
        </div>
      </div>

      {isCurrentLockedForCandidate ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#111', border: '1px solid #222', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Icons.Lock /></div>
            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>Chat is Locked</h3>
            <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>This conversation will be unlocked automatically if the employer decides to proceed with your application.</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollContainerRef} className="premium-scroll" style={{ flex: 1, overflowY: 'auto', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ alignSelf: 'center', background: '#111', border: '1px solid #222', padding: '8px 20px', borderRadius: '20px', fontSize: '11px', color: '#666', marginBottom: '30px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Application started {new Date(currentApp.createdAt).toLocaleDateString()}
            </div>
            {currentApp.messages.map((m: any, index: number) => {
              const isMine = m.senderId === user?.id;
              const prevMsg = index > 0 ? currentApp.messages[index - 1] : null;
              const nextMsg = index < currentApp.messages.length - 1 ? currentApp.messages[index + 1] : null;
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== m.senderId;
              const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;
              const currentDate = new Date(m.createdAt).toLocaleDateString();
              const prevDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;
              
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {currentDate !== prevDate && <div style={{ alignSelf: 'center', margin: '20px 0', fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{currentDate}</div>}
                  <div style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginTop: isFirstInGroup ? '12px' : '2px' }}>
                    <div style={{ 
                      background: isMine ? '#10b981' : '#111', color: isMine ? '#000' : '#fff', border: isMine ? 'none' : '1px solid #222',
                      padding: '14px 20px', borderRadius: '20px', borderTopLeftRadius: !isMine && !isFirstInGroup ? '6px' : '20px', borderBottomLeftRadius: !isMine && !isLastInGroup ? '6px' : (isMine ? '20px' : '6px'), borderTopRightRadius: isMine && !isFirstInGroup ? '6px' : '20px', borderBottomRightRadius: isMine && !isLastInGroup ? '6px' : (isMine ? '6px' : '20px'), fontSize: '15px', fontWeight: isMine ? '600' : '400', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.5'
                    }}>
                      {m.text}
                    </div>
                    {isLastInGroup && (
                      <div style={{ fontSize: '11px', color: '#555', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <span style={{ color: '#10b981' }}><Icons.Check /></span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* INPUT AREA */}
          <div style={{ padding: '20px 40px 30px', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: '15px', background: '#0a0a0a', padding: '10px 15px', borderRadius: '24px', border: '1px solid #222', alignItems: 'flex-end' }}>
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }} placeholder="Type your message..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '10px', resize: 'none', minHeight: '24px', maxHeight: '150px', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.5' }} />
              <button onClick={sendMsg} disabled={!msg.trim()} style={{ background: msg.trim() ? '#10b981' : '#222', color: msg.trim() ? '#000' : '#555', border: 'none', width: '48px', height: '48px', borderRadius: '16px', cursor: msg.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}><Icons.Send /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}