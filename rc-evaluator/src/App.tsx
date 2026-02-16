import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthProvider } from "@/features/auth/context/auth.context";
import { AuthUIProvider } from "./features/auth/context/authui.context";
import { ChatContainer } from "./features/chat/components/ChatContainer";
import { GlobalNotification } from "./features/notifications/globalNotification";
import { OnlineStatusChecker } from "./features/notifications/OnlineStatusChecker";
import { AppRouter } from "./routes";

function App() {
	useEffect(() => {
		// Only generate if we don't have a session at all
		if (!localStorage.getItem("token") && !localStorage.getItem("guest_id")) {
			const guestId = `guest_${uuidv4()}`;
			localStorage.setItem("guest_id", guestId);
		}
	}, []);

	return (
		<AuthProvider>
			<AuthUIProvider>
				{/* <ChatContainer /> */}
				<AppRouter />
				<GlobalNotification />
				<OnlineStatusChecker />
			</AuthUIProvider>
		</AuthProvider>
	);
}

export default App;
