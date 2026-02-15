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
			clear();
		}
	}, [isOnline, isOffline, show, clear]);

	return null;
};
