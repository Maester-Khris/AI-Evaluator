import { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { useChat } from '../hooks/useChat';
import { INITIAL_MOCK_MESSAGES } from "../constants";
import ChatSidebar from "./ChatSidebar";
import MainLayout from "@/layouts/MainLayout";

export const ChatContainer = () => {
  const {
    conversations,
    activeConversation,
    sendMessage,
    createNewConversation,
    setActiveId
  } = useChat([]);

  const sidebar = (
    <ChatSidebar
      conversations={conversations}
      activeId={activeConversation?.id}
      onSelect={setActiveId}
      onNewChat={createNewConversation}
    />
  );

  return (
    <MainLayout sidebar={sidebar}>
      <ChatWindow>
        <ChatWindow.Messages messages={activeConversation?.messages || []} />
        <ChatWindow.Input onSubmit={sendMessage} />
      </ChatWindow>
    </MainLayout>
  );
};

//  const [messages, setMessages] = useState<any[]>([]);
//   const handleSendMessage = async (text: string) => {
//     const newMsg = { role: 'user', content: text };
//     setMessages((prev) => [...prev, newMsg]);
//     console.log("Sending to backend:", text);
//   };
// <ChatWindow>
//   <ChatWindow.Messages messages={messages} />
//   <ChatWindow.Input onSubmit={handleSendMessage} />
// </ChatWindow>