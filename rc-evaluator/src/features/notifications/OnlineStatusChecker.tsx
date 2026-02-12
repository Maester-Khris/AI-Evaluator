import { useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const OnlineStatusChecker = () => {
	const { isOnline, isOffline } = useOnlineStatus();
	const { show, clear } = useNotification();

	useEffect(() => {
		if (isOffline) {
			show(
				"You are currently offline. Some features may not work properly.",
				"offline",
			);
		} else {
			// Clear the offline notification when coming back online
			clear();
		}
	}, [isOnline, isOffline, show, clear]);

	return null; // This component doesn't render anything
};
