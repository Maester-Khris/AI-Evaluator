import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (userdata:any) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:{children:ReactNode}) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Intial user fetching: fetch user from token
    useEffect(()=>{
        
    },[]);

    const login = useCallback((userData:any) =>{

    }, []);

    const logout = useCallback(() =>{

    }, []);

    // exported context value
    const value: AuthContextType = {
        user, login, logout, isLoading, isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>   
    );
}