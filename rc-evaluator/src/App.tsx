import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/features/auth/context/auth.context";
import { AuthUIProvider } from "./features/auth/context/authui.context";
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
		<HelmetProvider>
			<AuthProvider>
				<AuthUIProvider>
					<AppRouter />
				</AuthUIProvider>
			</AuthProvider>
		</HelmetProvider>
	);
}

export default App;
