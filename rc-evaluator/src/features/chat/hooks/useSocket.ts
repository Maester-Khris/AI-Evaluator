import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const useSocket = () => {
	const { token } = useAuth();
	const socketRef = useRef<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!token) return;

		// Initialize long-lived connection
		socketRef.current = io(`${import.meta.env.VITE_API_HOST}`, {
			auth: { token },
		});
		socketRef.current.on("connect", () => setIsConnected(true));
		socketRef.current.on("disconnect", () => setIsConnected(false));

		return () => {
			socketRef.current?.disconnect();
		};
	}, [token]);

	return { socket: socketRef.current, isConnected };
};
