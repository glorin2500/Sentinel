"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 p-8 rounded-2xl border border-white/10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                        <Shield size={48} className="text-primary" strokeWidth={2} />
                        <div className="absolute inset-0 bg-primary/20 blur-xl" />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-white mb-2 text-center">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-sm text-zinc-400 mb-6 text-center">
                    {isLogin ? 'Sign in to protect yourself from fraud' : 'Join Sentinel to stay safe'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none transition-colors"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                            <p className="text-red-500 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-black font-black rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        {isLogin ? (
                            <>
                                Don't have an account? <span className="text-primary font-bold">Sign up</span>
                            </>
                        ) : (
                            <>
                                Already have an account? <span className="text-primary font-bold">Sign in</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
