// @ts-nocheck - Supabase type inference issues with strict mode
import { supabase, isSupabaseConfigured } from './client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
    id: string;
    email?: string;
    phone?: string;
    full_name?: string;
}

export class AuthService {
    /**
     * Sign up with email and password
     */
    static async signUp(email: string, password: string, fullName?: string) {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;

        // Create user profile
        if (data.user) {
            await supabase.from('users').insert({
                id: data.user.id,
                email: data.user.email,
                full_name: fullName
            });
        }

        return data;
    }

    /**
     * Sign in with email and password
     */
    static async signIn(email: string, password: string) {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Update last login
        if (data.user) {
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id);
        }

        return data;
    }

    /**
     * Sign in with phone OTP
     */
    static async signInWithPhone(phone: string) {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase.auth.signInWithOtp({
            phone
        });

        if (error) throw error;
        return data;
    }

    /**
     * Verify phone OTP
     */
    static async verifyOTP(phone: string, token: string) {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms'
        });

        if (error) throw error;

        // Create/update user profile
        if (data.user) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!existingUser) {
                await supabase.from('users').insert({
                    id: data.user.id,
                    phone: data.user.phone
                });
            } else {
                await supabase
                    .from('users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.user.id);
            }
        }

        return data;
    }

    /**
     * Sign out
     */
    static async signOut() {
        if (!isSupabaseConfigured()) {
            return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    /**
     * Get current user
     */
    static async getCurrentUser(): Promise<User | null> {
        if (!isSupabaseConfigured()) {
            return null;
        }

        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    /**
     * Get current session
     */
    static async getSession(): Promise<Session | null> {
        if (!isSupabaseConfigured()) {
            return null;
        }

        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    /**
     * Listen to auth state changes
     */
    static onAuthStateChange(callback: (user: User | null) => void) {
        if (!isSupabaseConfigured()) {
            return () => { };
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }

    /**
     * Reset password
     */
    static async resetPassword(email: string) {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) throw error;
    }

    /**
     * Update password
     */
    static async updatePassword(newPassword: string) {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
    }
}
