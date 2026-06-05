import { useChat } from "../hooks/useChat";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";

export default function MessagesPage() {
  const chatLogic = useChat();

  if (chatLogic.loading) {
    return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading Communications...</div>;
  }

  return (
    <div className="msg-page-wrapper" style={{ background: '#050505', minHeight: 'calc(100vh - 80px)', display: 'flex', justifyContent: 'center', padding: '30px 20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Premium Dark Glow */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className={`msg-messenger-container ${chatLogic.id ? 'chat-active' : 'list-active'}`} style={{ width: '100%', maxWidth: '1280px', height: 'calc(100vh - 140px)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', display: 'flex', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', zIndex: 1 }}>
        
        <ChatSidebar 
          filteredChats={chatLogic.filteredChats}
          searchQuery={chatLogic.searchQuery}
          setSearchQuery={chatLogic.setSearchQuery}
          activeId={chatLogic.id}
          user={chatLogic.user}
          checkIsOnline={chatLogic.checkIsOnline}
          apiUrl={chatLogic.apiUrl}
        />

        <ChatWindow 
          currentApp={chatLogic.currentApp}
          isCurrentLockedForCandidate={chatLogic.isCurrentLockedForCandidate}
          user={chatLogic.user}
          apiUrl={chatLogic.apiUrl}
          msg={chatLogic.msg}
          setMsg={chatLogic.setMsg}
          sendMsg={chatLogic.sendMsg}
          scrollContainerRef={chatLogic.scrollContainerRef}
          checkIsOnline={chatLogic.checkIsOnline}
        />

      </div>
    </div>
  );
}