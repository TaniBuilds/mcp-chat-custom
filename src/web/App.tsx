import React, { useEffect, useState } from "react";
import styles from "./App.module.css";
import { Chat } from "./Chat";

interface ChatListItem {
  id: string;
  title: string;
  model: string | undefined;
  lastModified: string;
  messageCount: number;
}

function App() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleTitleChange = (chatId: string, newTitle: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      setChats(data);
      // Select the first chat by default if available
      if (data.length > 0 && !selectedChatId) {
        setSelectedChatId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch chats");
    }
  };

  useEffect(() => {
    fetchChats();
  }, [selectedChatId]);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `/api/chat?chatId=${encodeURIComponent(chatId)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }
      const remaining = chats.filter((c) => c.id !== chatId);
      setChats(remaining);
      if (selectedChatId === chatId) {
        setSelectedChatId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete chat");
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromChatId: selectedChatId }),
      });
      if (!response.ok) {
        throw new Error("Failed to create new chat");
      }
      const newChat = await response.json();
      setChats((prevChats) => [newChat, ...prevChats]);
      setSelectedChatId(newChat.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create new chat"
      );
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>MCP Chat</h1>
          <button className={styles.newChatButton} onClick={handleNewChat}>
            New Chat
          </button>
        </div>
        {error ? (
          <div className={styles.error}>Error: {error}</div>
        ) : (
          <div className={styles.chatsList}>
            {chats.length === 0 ? (
              <p>No chats found. Start a new chat to begin!</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${
                    selectedChatId === chat.id ? styles.selectedChat : ""
                  }`}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  <div className={styles.chatItemHeader}>
                    <h3 style={{ margin: 0 }}>
                      {chat.title || chat.id.replace(/\.json$/, "")}
                    </h3>
                    <button
                      className={styles.deleteChatButton}
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      title="Delete chat"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.chatMeta}>
                    <span>Model: {chat.model || "Default"}</span>
                    <span>Messages: {chat.messageCount}</span>
                    <span>
                      Created: {new Date(chat.lastModified).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className={styles.mainContent}>
        {selectedChatId ? (
          <Chat chatId={selectedChatId} onTitleChange={handleTitleChange} />
        ) : (
          <div className={styles.noChatSelected}>
            Select a chat from the sidebar to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
