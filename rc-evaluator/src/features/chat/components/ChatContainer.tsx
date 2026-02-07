import { ChatWindow } from "./ChatWindow";
import { useChat } from '../hooks/useChat';
import { INITIAL_MOCK_MESSAGES } from "../constants";
import ChatSidebar from "./ChatSidebar";
import MainLayout from "@/layouts/MainLayout";
import UserSection from "@/features/auth/components/UserSection";
import AuthModal from "@/features/auth/components/AuthModal";


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
      userSection={<UserSection />}
    />
  );

  return (
    <MainLayout sidebar={sidebar}>
      <ChatWindow>
        <ChatWindow.Messages messages={activeConversation?.messages || []} />
        <ChatWindow.Input onSubmit={sendMessage} />
      </ChatWindow>
      <AuthModal />
    </MainLayout>
  );
};
