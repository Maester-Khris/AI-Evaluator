import { useEffect, useRef } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useServerStatus } from "@/hooks/useServerStatus";

const API_BASE = `${import.meta.env.VITE_API_HOST}/api`;

export const OnlineStatusChecker = () => {
	const { isOnline, isOffline } = useOnlineStatus();
	const show = useNotification((state) => state.show);
	const clear = useNotification((state) => state.clear);
	const setAvailable = useServerStatus((state) => state.setAvailable);

	const hasChecked = useRef(false);
	const lastStatus = useRef<"active" | "degraded" | "unknown">("active");
	const backoffDelay = useRef(5000); // Start with 5s backoff
	const timerRef = useRef<any>(null);

	useEffect(() => {
		const checkBackend = async () => {
			try {
				const response = await fetch(`${API_BASE}/system/health`);
				const data = await response.json().catch(() => ({}));

				if (response.ok) {
					setAvailable(true, data.dependencies);
					if (lastStatus.current !== "active") {
						clear();
						lastStatus.current = "active";
					}
					backoffDelay.current = 30000; // Reset to 30s on success
				} else {
					setAvailable(false, data.dependencies);
					if (lastStatus.current !== "degraded") {
						show("Server is currently degraded or under maintenance.", "error");
						lastStatus.current = "degraded";
					}
					// Double the backoff on failure, max 60s
					backoffDelay.current = Math.min(backoffDelay.current * 2, 60000);
				}
			} catch (error) {
				setAvailable(false);
				if (lastStatus.current !== "degraded") {
					show(
						"Unable to connect to the server. Check your connection or backend status.",
						"error",
					);
					lastStatus.current = "degraded";
				}
				backoffDelay.current = Math.min(backoffDelay.current * 2, 60000);
			}

			// Schedule next check
			timerRef.current = setTimeout(checkBackend, backoffDelay.current);
		};

		if (isOffline) {
			setAvailable(false);
			if (lastStatus.current !== "unknown") {
				show(
					"You are currently offline. Some features may not work properly.",
					"offline",
				);
				lastStatus.current = "unknown";
			}
			return;
		}

		// Initial check with double-call prevention for StrictMode
		if (!hasChecked.current) {
			hasChecked.current = true;
			checkBackend();
		} else {
			// If already checked, just ensure a timer is running
			if (!timerRef.current) {
				timerRef.current = setTimeout(checkBackend, backoffDelay.current);
			}
		}

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = null;
			// NOTE: We DON'T reset hasChecked here to prevent StrictMode double-fire
			// It will be reset when the user re-enters the route (component re-mounts)
		};
	}, [isOnline, isOffline, show, clear, setAvailable]);

	return null;
};
