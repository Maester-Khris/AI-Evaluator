import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
    const { token } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        // Initialize long-lived connection
        // , {
        //     path: "/api/socket.io",
        //     auth: { token }, // Node can verify this in middleware
        //     transports: ['websocket'],
        // }
        socketRef.current = io(`${import.meta.env.VITE_API_HOST}`);

        socketRef.current.on('connect', () => setIsConnected(true));
        socketRef.current.on('disconnect', () => setIsConnected(false));

        return () => {
            socketRef.current?.disconnect();
        };
    }, [token]);

    return { socket: socketRef.current, isConnected };
}


