import { useChat } from "../../hooks/useChat";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";

import styles from "./MessagesPage.module.css";

export default function MessagesPage() {
  const chatLogic = useChat();

  if (chatLogic.loading) {
    return <div className={styles.loading}>Loading Communications...</div>;
  }

  return (
    <>
      {chatLogic.error && <p role="alert" className={styles.error}>{chatLogic.error}</p>}
      <div className={styles.page}>

        {/* Premium Dark Glow */}
        <div className={styles.glow} />

        <div className={styles.messenger} data-view={chatLogic.id ? "chat" : "list"}>

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
    </>
  );
}
