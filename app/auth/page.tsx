"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';

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
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Logo & Branding */}
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 mb-6 relative"
                        >
                            <Shield size={40} className="text-primary" strokeWidth={2.5} />
                            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                        </motion.div>

                        <h1 className="text-4xl font-black text-white mb-2">
                            <span className="text-primary">SENTINEL</span>
                        </h1>
                        <p className="text-zinc-400">
                            {isLogin ? 'Welcome back, guardian' : 'Join the protection network'}
                        </p>
                    </div>

                    {/* Auth Card */}
                    <motion.div
                        layout
                        className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 p-1 bg-black/50 rounded-lg">
                            <button
                                onClick={() => {
                                    setIsLogin(true);
                                    setError('');
                                }}
                                className={`flex-1 py-2.5 rounded-md font-bold text-sm transition-all ${isLogin
                                        ? 'bg-primary text-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setIsLogin(false);
                                    setError('');
                                }}
                                className={`flex-1 py-2.5 rounded-md font-bold text-sm transition-all ${!isLogin
                                        ? 'bg-primary text-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="guardian@sentinel.io"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                                        className="w-full pl-12 pr-12 py-3.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                    >
                                        <p className="text-red-500 text-sm">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-primary text-black font-black rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                                        {isLogin ? 'Access Dashboard' : 'Create Account'}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Features (Sign Up Only) */}
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 pt-6 border-t border-white/10 space-y-3"
                            >
                                {[
                                    'Real-time fraud detection',
                                    'AI-powered risk analysis',
                                    'Community threat intelligence'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                                        <CheckCircle size={16} className="text-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Footer */}
                    <p className="text-center text-xs text-zinc-500">
                        Protected by military-grade encryption
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
