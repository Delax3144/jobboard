import type { useChat } from '../../hooks/useChat';
// src/components/chat/ChatSidebar.tsx
import { Link } from "react-router-dom";

const Icons = {
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
};

const formatChatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function ChatSidebar({ filteredChats, searchQuery, setSearchQuery, activeId, user, checkIsOnline, apiUrl }: Pick<ReturnType<typeof useChat>, 'filteredChats' | 'searchQuery' | 'setSearchQuery' | 'user' | 'checkIsOnline' | 'apiUrl'> & { activeId?: string }) {

  return (
    <div className="msg-sidebar-panel" style={{ width: '380px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: '#0a0a0a', flexShrink: 0 }}>
      <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Messages</h2>
        <div style={{ position: 'relative' }}>
          <input 
            aria-label="Search conversations"
            placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '12px 15px 12px 42px', color: '#fff', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} 
            onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#222'} 
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex' }}><Icons.Search /></span>
        </div>
      </div>

      <div className="premium-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {filteredChats.map((chat) => {
          const isActive = activeId === chat.id;
          const isEmployer = user?.role === 'employer';
          const partnerName = isEmployer ? `${chat.candidate?.firstName || ''} ${chat.candidate?.lastName || ''}`.trim() || chat.candidate?.email : chat.job?.companyName;
          const partnerAvatar = isEmployer ? chat.candidate?.avatarUrl : chat.job?.companyLogo;
          const isUserOnline = checkIsOnline(isEmployer ? chat.candidate?.lastActive : chat.job?.owner?.lastActive);
          const lastMsgTimeDate = chat.messages?.[0]?.createdAt || chat.createdAt;
          const timeDisplay = formatChatTime(lastMsgTimeDate);
          const hasUnread = chat.hasUpdate === true;
          const unreadCount = hasUnread ? 1 : 0; 

          return (
            <Link key={chat.id} to={`/messages/${chat.id}`} aria-current={isActive ? 'page' : undefined} aria-label={`${partnerName} — ${chat.job.title}${hasUnread ? ' — unread updates' : ''}`} style={{ textDecoration: 'none', padding: '20px 30px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', background: isActive ? 'rgba(16, 185, 129, 0.05)' : 'transparent', display: 'flex', gap: '16px', alignItems: 'center', transition: 'background 0.2s', position: 'relative' }}>
              {isActive && <div style={{ position: 'absolute', left: 0, top: '20px', bottom: '20px', width: '3px', background: '#10b981', borderRadius: '0 4px 4px 0' }} />}
              <div style={{ position: 'relative' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: isEmployer ? '50%' : '16px', background: '#111', border: isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden', color: isActive ? '#fff' : '#666', fontSize: '20px' }}>
                  {partnerAvatar ? <img src={partnerAvatar?.startsWith('http') ? partnerAvatar : `${apiUrl}${partnerAvatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{partnerName?.charAt(0).toUpperCase()}</span>}
                </div>
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: isUserOnline ? '#10b981' : '#444', borderRadius: '50%', border: '3px solid #0a0a0a', transition: 'all 0.2s' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '15px' }}>{partnerName}</div>
                  <div style={{ fontSize: '12px', color: unreadCount > 0 ? '#10b981' : '#666', fontWeight: unreadCount > 0 ? 700 : 500 }}>{timeDisplay}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.job.title}{chat.messages?.[0]?.text ? ` · ${chat.messages[0].text}` : ''}
                  </div>
                  {unreadCount > 0 && <div style={{ background: '#10b981', color: '#000', fontSize: '11px', fontWeight: 900, padding: '2px 6px', borderRadius: '8px', minWidth: '20px', textAlign: 'center' }}>{unreadCount}</div>}
                </div>
              </div>
            </Link>
          );
        })}
        {filteredChats.length === 0 && (
          <div style={{ padding: '60px 30px', textAlign: 'center', color: '#555' }}><div style={{ fontSize: '15px', fontWeight: 600 }}>No active chats found</div></div>
        )}
      </div>
    </div>
  );
}
