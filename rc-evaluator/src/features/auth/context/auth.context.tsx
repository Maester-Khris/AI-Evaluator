import React, {
	createContext,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import { useNotification } from "@/hooks/useNotification";

interface AuthContextType {
	user: any | null;
	token: string | null;
	isAuthenticated: boolean;
	login: (userdata: any) => void;
	logout: () => void;
	signup: (userdata: any) => void;
	isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<any | null>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token"),
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { show } = useNotification();
	const API_BASE = `${import.meta.env.VITE_API_HOST}/api`;

	const loginAsGuest = async (id: string) => {
		try {
			const res = await fetch(`${API_BASE}/auth/guest`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Guest User", id }),
			});
			const data = await res.json();
			console.log("Guest login success", data);

			if (data.accessToken) {
				localStorage.setItem("token", data.accessToken);
				localStorage.setItem("user", JSON.stringify(data.user));

				setToken(data.accessToken);
				setUser(data.user);
			}
		} catch (err) {
			console.error("Guest login failed", err);
			show("Login failed. Please try again.", "error");
		}
	};

	// Initial user fetching: Validate token on load
	useEffect(() => {
		const initAuth = async () => {
			const storedToken = localStorage.getItem("token");
			const guestId = localStorage.getItem("guest_id");
			console.log("initauth started ..");
			// 1. If we have a token, verify the session
			if (storedToken) {
				console.log("initauth has token ..");
				try {
					const res = await fetch(`${API_BASE}/auth/me`, {
						headers: { Authorization: `Bearer ${storedToken}` },
					});
					if (!res.ok) throw new Error("Invalid session");

					const userData = await res.json();
					setUser(userData);
				} catch (err) {
					logout();
				} finally {
					setIsLoading(false);
				}
				return;
			}

			// 2. No token? Auto-login as guest if we have a generated ID
			if (guestId) {
				console.log("initauth has token ..");
				await loginAsGuest(guestId);
			}

			setIsLoading(false);
		};

		initAuth();
	}, []);

	const signup = useCallback(async (credentials: any) => {
		setIsLoading(true);
		try {
			const guestId = localStorage.getItem("guest_id");
			const tempConversationIds = JSON.parse(
				localStorage.getItem("temp_conversation_ids") || "[]",
			);

			const res = await fetch(`${API_BASE}/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...credentials, guestId, tempConversationIds }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Signup failed");
			}

			const { user, accessToken, conversationMappings } = data;

			// Handle Conversation Migration
			if (conversationMappings) {
				console.log("Migrating conversations:", conversationMappings);
				// We'll store this in localStorage temporarily so other components can pick it up
				// or emit an event. For now, let's clear the old guest tracking
				localStorage.removeItem("guest_id");
				localStorage.removeItem("temp_conversation_ids");

				// Optional: Trigger a storage event if other tabs need to know (not strictly necessary for SPA)
				window.dispatchEvent(new CustomEvent('auth:migration', { detail: conversationMappings }));
			}

			localStorage.setItem("token", accessToken);
			localStorage.setItem("user", JSON.stringify(user));
			setToken(accessToken);
			setUser(user);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const login = useCallback(async (credentials: any) => {
		setIsLoading(true);
		try {
			const guestId = localStorage.getItem("guest_id");
			const tempConversationIds = JSON.parse(
				localStorage.getItem("temp_conversation_ids") || "[]",
			);

			const res = await fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...credentials, guestId, tempConversationIds }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Login failed");
			}

			const { user, accessToken, conversationMappings } = data;

			// Handle Conversation Migration
			if (conversationMappings) {
				console.log("Migrating conversations:", conversationMappings);
				localStorage.removeItem("guest_id");
				localStorage.removeItem("temp_conversation_ids");

				window.dispatchEvent(new CustomEvent('auth:migration', { detail: conversationMappings }));
			}

			localStorage.setItem("token", accessToken);
			localStorage.setItem("user", JSON.stringify(user));
			setToken(accessToken);
			setUser(user);
		} catch (err: any) {
			console.error("login failed", err);
			show(err.message || "Login failed. Please try again.", "error");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			// Notify the backend to revoke the session/token
			if (token) {
				await fetch(`${API_BASE}/auth/logout`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});
			}
		} catch (err) {
			console.error(
				"Backend token revocation failed, proceeding with local logout",
				err,
			);
		} finally {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			setToken(null);
			setUser(null);
		}
	}, [token]);

	// exported context value
	const value: AuthContextType = {
		user,
		signup,
		login,
		logout,
		isLoading,
		isAuthenticated: !!user && !user.isGuest,
		token,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
