import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChatContainer } from "@/features/chat/components/ChatContainer";
import { GlobalNotification } from "@/features/notifications/globalNotification";
import { OnlineStatusChecker } from "@/features/notifications/OnlineStatusChecker";
import { PublicLayout } from "@/layouts/PublicLayout";
import { FeaturesPage } from "@/pages/landing/FeaturesPage";
import { HomePage } from "@/pages/landing/HomePage";

export const AppRouter = () => {
	return (
		<BrowserRouter>
			<GlobalNotification />
			<OnlineStatusChecker />
			<Routes>
				{/* Public Marketing Routes */}
				<Route element={<PublicLayout />}>
					<Route path="/" element={<HomePage />} />
					<Route path="/features" element={<FeaturesPage />} />
				</Route>

				{/* Protected/App Routes */}
				<Route path="/chat" element={<ChatContainer />} />

				{/* Fallback */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
};
