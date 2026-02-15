import AuthModal from "@/features/auth/components/AuthModal";
import UserSection from "@/features/auth/components/UserSection";
import MainLayout from "@/layouts/MainLayout";
import { useChat } from "../hooks/useChat";
import ChatSidebar from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { useAIReview } from "@/features/review/hooks/useEvaluation";

export const ChatContainer = () => {
	const {
		conversations,
		activeConversation,
		sendMessage,
		sendMessageToSocket,
		createNewConversation,
		setActiveId,
	} = useChat([]);
	const { sendEvaluationToSocket } = useAIReview();

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
				<ChatWindow.Messages messages={activeConversation?.messages || []} onEvaluate={sendEvaluationToSocket} />
				<ChatWindow.Input onSubmit={sendMessageToSocket} />
			</ChatWindow>
			<AuthModal />
		</MainLayout>
	);
};
