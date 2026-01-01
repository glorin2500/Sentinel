"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Zap } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-primary/20 w-full max-w-md shadow-2xl shadow-primary/5"
            >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 mb-4 relative"
                    >
                        <Shield size={40} className="text-primary" strokeWidth={2.5} />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>

                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        SENTINEL
                    </h1>
                    <p className="text-sm text-zinc-400">
                        {isLogin ? 'Access your fraud detection dashboard' : 'Join the fight against fraud'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {!isLogin && (
                            <p className="text-xs text-zinc-500 mt-2">Minimum 6 characters</p>
                        )}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                            >
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary text-black font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
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

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                        <Shield size={14} className="text-primary" />
                        <span>Secured by Supabase Authentication</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
