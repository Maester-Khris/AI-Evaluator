import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const OnlineStatusChecker = () => {
	const { isOnline, isOffline } = useOnlineStatus();
	const { show, clear } = useNotification();
	const { pathname } = useLocation();

	useEffect(() => {
		// Don't show status notifications on public marketing pages
		const isPublicPage = ["/", "/features", "/docs"].includes(pathname);
		if (isPublicPage) return;
		if (isOffline) {
			show(
				"You are currently offline. Some features may not work properly.",
				"offline",
			);
		} else {
			clear();
		}
	}, [isOnline, isOffline, show, clear]);

	return null;
};
