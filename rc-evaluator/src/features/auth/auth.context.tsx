import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';

interface AuthContextType {
    user: any | null;
    token: string|null;
    isAuthenticated: boolean;
    login: (userdata: any) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const API_BASE = import.meta.env.VITE_API_HOST;

    // Initial user fetching: Validate token on load
    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                // GET /api/auth/me or similar
                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await res.json();
                setUser(userData);
            } catch (err) {
                logout(); // Token invalid, clear it
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = useCallback(async (credentials: any) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const { user, token } = await res.json();
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Notify the backend to revoke the session/token
            if (token) {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (err) {
            console.error("Backend token revocation failed, proceeding with local logout", err);
        } finally {
            // Always clear local state regardless of server success
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    }, [token]);

    // exported context value
    const value: AuthContextType = {
        user, login, logout, isLoading, isAuthenticated: !!user, token
    };

    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>
    );
}