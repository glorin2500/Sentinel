"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthService } from './supabase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        AuthService.getCurrentUser()
            .then(setUser)
            .finally(() => setLoading(false));

        // Listen for auth changes
        const unsubscribe = AuthService.onAuthStateChange(setUser);
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        const { user } = await AuthService.signIn(email, password);
        setUser(user);
    };

    const signUp = async (email: string, password: string) => {
        const { user } = await AuthService.signUp(email, password);
        setUser(user);
    };

    const signOut = async () => {
        await AuthService.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
