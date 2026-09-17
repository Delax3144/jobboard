import type { useChat } from '../../hooks/useChat';

import { Link } from "react-router-dom";

import styles from "./ChatSidebar.module.css";

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
    <div className={`msg-sidebar-panel ${styles.panel}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
        <div className={styles.searchField}>
          <input
            aria-label="Search conversations"
            placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}

          />
          <span className={styles.searchIcon}><Icons.Search /></span>
        </div>
      </div>

      <div className={`premium-scroll ${styles.list}`}>
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
            <Link key={chat.id} to={`/messages/${chat.id}`} aria-current={isActive ? 'page' : undefined} aria-label={`${partnerName} — ${chat.job.title}${hasUnread ? ' — unread updates' : ''}`} className={styles.conversation}>
              {isActive && <div className={styles.activeMarker} />}
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar} data-person={isEmployer}>
                  {partnerAvatar ? <img src={partnerAvatar?.startsWith('http') ? partnerAvatar : `${apiUrl}${partnerAvatar}`} className={styles.avatarImage} /> : <span>{partnerName?.charAt(0).toUpperCase()}</span>}
                </div>
                <div className={styles.presence} data-online={isUserOnline} />
              </div>
              <div className={styles.preview}>
                <div className={styles.previewHeader}>
                  <div className={styles.partnerName}>{partnerName}</div>
                  <div className={styles.time} data-unread={hasUnread}>{timeDisplay}</div>
                </div>
                <div className={styles.previewBody}>
                  <div className={styles.lastMessage}>
                    {chat.job.title}{chat.messages?.[0]?.text ? ` · ${chat.messages[0].text}` : ''}
                  </div>
                  {unreadCount > 0 && <div className={styles.unreadBadge}>{unreadCount}</div>}
                </div>
              </div>
            </Link>
          );
        })}
        {filteredChats.length === 0 && (
          <div className={styles.emptyState}><div className={styles.emptyLabel}>No active chats found</div></div>
        )}
      </div>
    </div>
  );
}
