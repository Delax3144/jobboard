import type { useChat } from '../../hooks/useChat';

import { Link, useNavigate } from "react-router-dom";

import styles from "./ChatWindow.module.css";

const Icons = {
  Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Lock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  ArrowLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
};

export default function ChatWindow({ currentApp, isCurrentLockedForCandidate, user, apiUrl, msg, setMsg, sendMsg, scrollContainerRef, checkIsOnline }: Pick<ReturnType<typeof useChat>, 'currentApp' | 'isCurrentLockedForCandidate' | 'user' | 'apiUrl' | 'msg' | 'setMsg' | 'sendMsg' | 'scrollContainerRef' | 'checkIsOnline'>) {
  const navigate = useNavigate();

  if (!currentApp) {
    return (
      <div className={`msg-chat-window ${styles.emptyWindow}`}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}><Icons.Search /></div>
          <h3 className={styles.emptyTitle}>Your Messages</h3>
          <p className={styles.emptyDescription}>Select a conversation from the left to start chatting</p>
        </div>
      </div>
    );
  }

  const partnerName = user?.role === 'employer' ? `${currentApp.candidate?.firstName || ''} ${currentApp.candidate?.lastName || ''}`.trim() || currentApp.candidate?.email : currentApp.job.companyName;
  const partnerLink = user?.role === 'employer' ? `/candidate/${currentApp.candidate.id}` : `/jobs/${currentApp.job.id}`;
  const partnerAvatar = user?.role === 'employer' ? currentApp.candidate?.avatarUrl : currentApp.job?.companyLogo;
  const isOnline = checkIsOnline(user?.role === 'employer' ? currentApp.candidate?.lastActive : currentApp.job?.owner?.lastActive);

  return (
    <div className={`msg-chat-window ${styles.window}`}>
      <div className={styles.header}>
        <div className={styles.partner}>

          <button aria-label="Back to conversations"  onClick={() => navigate('/messages')} className={styles.backButton}>
            <Icons.ArrowLeft />
          </button>

          <div className={styles.avatar} data-person={user?.role === 'employer'}>
            {partnerAvatar ? <img src={partnerAvatar?.startsWith('http') ? partnerAvatar : `${apiUrl}${partnerAvatar}`} className={styles.avatarImage}/> : <span>{partnerName[0].toUpperCase()}</span>}
          </div>
          <div>
            <Link to={partnerLink} className={styles.partnerLink} >
              {partnerName}
            </Link>
            <div className={styles.presenceLabel}>
              <span className={styles.presence} data-online={isOnline} /> {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <div className={styles.jobBadge}>
          <span className={styles.contextLabel}>Context</span>
          <span className={styles.jobTitle}>{currentApp.job.title}</span>
        </div>
      </div>

      {isCurrentLockedForCandidate ? (
        <div className={styles.lockedWindow}>
          <div className={styles.lockedContent}>
            <div className={styles.lockedIcon}><Icons.Lock /></div>
            <h3 className={styles.lockedTitle}>Chat is Locked</h3>
            <p className={styles.lockedDescription}>This conversation will be unlocked automatically if the employer decides to proceed with your application.</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollContainerRef} className={`premium-scroll ${styles.messages}`}>
            <div className={styles.startDate}>
              Application started {new Date(currentApp.createdAt).toLocaleDateString()}
            </div>
            {currentApp.messages.map((m, index) => {
              const isMine = m.senderId === user?.id;
              const prevMsg = index > 0 ? currentApp.messages[index - 1] : null;
              const nextMsg = index < currentApp.messages.length - 1 ? currentApp.messages[index + 1] : null;
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== m.senderId;
              const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;
              const currentDate = new Date(m.createdAt).toLocaleDateString();
              const prevDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;

              return (
                <div key={m.id} className={styles.messageRow}>
                  {currentDate !== prevDate && <div className={styles.dateSeparator}>{currentDate}</div>}
                  <div className={styles.messageGroup} data-mine={isMine} data-first={isFirstInGroup}>
                    <div className={styles.bubble}>
                      {m.text}
                    </div>
                    {isLastInGroup && (
                      <div className={styles.messageTime}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <span className={styles.sentIndicator}><Icons.Check /></span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.composer}>
            <div className={styles.composerInner}>
              <textarea aria-label="Message" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }} placeholder="Type your message..." className={styles.messageInput} />
              <button aria-label="Send message" onClick={sendMsg} disabled={!msg.trim()} className={styles.sendButton}><Icons.Send /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
