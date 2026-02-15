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
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));

			setToken(data.token);
			setUser(data.user);
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
			const res = await fetch(`${API_BASE}/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(credentials),
			});
			const { user, token } = await res.json();
			localStorage.setItem("token", token);
			setToken(token);
			setUser(user);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const login = useCallback(async (credentials: any) => {
		setIsLoading(true);
		try {
			const res = await fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(credentials),
			});
			const { user, token } = await res.json();
			localStorage.setItem("token", token);
			setToken(token);
			setUser(user);
		} catch (err) {
			console.error("login failed", err);
			show("Login failed. Please try again.", "error");
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
		isAuthenticated: !!user,
		token,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
