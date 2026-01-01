"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { IntroSplash } from "@/components/ui/intro-splash";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, User, Shield, Bell, LogOut, Lock, Key, Smartphone, Wifi, Eye, EyeOff, Check, Sun, Moon } from "lucide-react";
import { useSentinelStore } from "@/lib/store";
import { BiometricGate } from "@/components/auth/biometric-gate";
import { useAuth } from "@/lib/auth-context";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const router = useRouter();
    const { userProfile, updateProfile, isAuthenticated, setAuthenticated, isSplashComplete, setSplashComplete } = useSentinelStore();
    const { user, signOut } = useAuth();

    // Security settings state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [autoLockEnabled, setAutoLockEnabled] = useState(true);
    const [vpnRequired, setVpnRequired] = useState(false);

    // Preferences state
    const [darkMode, setDarkMode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoScanEnabled, setAutoScanEnabled] = useState(false);

    useEffect(() => {
        (window as any).toggleAccountPanel = () => setIsAccountOpen(prev => !prev);
        (window as any).__sentinelUserName = userProfile.name;
    }, [userProfile.name]);

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await signOut();
            setIsAccountOpen(false);
            setAuthenticated(false);
            router.push('/auth');
        }
    };

    const openSecuritySettings = () => {
        setIsAccountOpen(false);
        setIsSecurityOpen(true);
    };

    const openPreferences = () => {
        setIsAccountOpen(false);
        setIsPreferencesOpen(true);
    };

    // 1. Biometric Gate
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
                <BiometricGate />
            </div>
        );
    }

    // 2. Intro Splash
    if (!isSplashComplete) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
                <IntroSplash onComplete={() => setSplashComplete(true)} />
            </div>
        );
    }

    // 3. Main Dashboard
    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pb-32">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Enhanced Header with Sentinel Vibe */}
                <motion.header
                    className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black via-black/95 to-black/80 backdrop-blur-xl border-b border-primary/20"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                >
                    {/* Left: Logo with glow effect */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <motion.div
                            className="relative h-11 px-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center group cursor-pointer"
                            whileHover={{ boxShadow: "0 0 40px rgba(124,255,178,0.5)" }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Animated glow */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Logo text */}
                            <span className="relative text-black font-black text-base tracking-tight uppercase">
                                Sentinel
                            </span>

                            {/* Shimmer effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </motion.div>

                        {/* Status indicator */}
                        <motion.div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.div
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [1, 0.7, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                Active
                            </span>
                        </motion.div>
                    </motion.div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <motion.button
                            className="relative h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/30 transition-all group"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Notifications"
                        >
                            <Bell size={18} className="text-zinc-400 group-hover:text-primary transition-colors" />
                            {/* Notification badge */}
                            <motion.div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-black flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                            >
                                <span className="text-[10px] font-black text-white">3</span>
                            </motion.div>
                        </motion.button>

                        {/* Theme Toggle with animation */}
                        <motion.button
                            onClick={() => useSentinelStore.getState().toggleTheme()}
                            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/30 transition-all group relative overflow-hidden"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Toggle theme"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            {useSentinelStore.getState().theme === 'dark' ? (
                                <Sun size={18} className="text-zinc-400 group-hover:text-primary transition-colors relative z-10" />
                            ) : (
                                <Moon size={18} className="text-zinc-600 group-hover:text-primary transition-colors relative z-10" />
                            )}
                        </motion.button>

                        {/* Account Avatar with enhanced styling */}
                        <motion.button
                            onClick={() => (window as any).toggleAccountPanel?.()}
                            className="relative h-11 w-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary border-2 border-primary/50 flex items-center justify-center text-sm font-black shadow-lg group overflow-hidden"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            {/* Animated ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-primary"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 0, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />

                            {/* Avatar letter */}
                            <span className="relative z-10">
                                {typeof window !== 'undefined' && (window as any).__sentinelUserName ? (window as any).__sentinelUserName[0].toUpperCase() : 'G'}
                            </span>

                            {/* Glow effect on hover */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-primary/20 blur-md"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                            />
                        </motion.button>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="pt-20 px-4 md:px-6 max-w-7xl mx-auto">
                    {children}
                </main>

                {/* Account Panel Overlay */}
                <AnimatePresence>
                    {isAccountOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAccountOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            />
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-full max-w-[340px] bg-background border-l border-white/10 z-[60] p-6 shadow-2xl overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Account</h2>
                                    <button onClick={() => setIsAccountOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="h-14 w-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-lg font-black border-2 border-primary/40">
                                            {userProfile.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{userProfile.name}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{userProfile.rank}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        {[
                                            { icon: User, label: "Edit Profile", action: () => { setIsAccountOpen(false); router.push('/profile'); } },
                                            { icon: Shield, label: "Security Settings", action: openSecuritySettings },
                                            { icon: Bell, label: "Preferences", action: openPreferences },
                                            { icon: LogOut, label: "Log Out", color: "text-red-400", action: handleLogout }
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={item.action}
                                                className={`w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all group ${item.color || "text-zinc-400"}`}
                                            >
                                                <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-bold group-hover:text-white transition-colors">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                        <p className="text-[9px] font-black text-primary tracking-widest mb-2">sentinel v9.5</p>
                                        <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">System optimized. All security layers active.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Security Settings Modal */}
                <AnimatePresence>
                    {isSecurityOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSecurityOpen(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl max-h-[90vh] bg-background border-2 border-primary/20 rounded-[32px] z-[60] p-8 shadow-2xl overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Security Settings</h2>
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Advanced Protection Controls</p>
                                    </div>
                                    <button onClick={() => setIsSecurityOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Two-Factor Authentication */}
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Key size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">Two-Factor Authentication</p>
                                                    <p className="text-[9px] text-zinc-500 mt-0.5">Extra layer of security for your account</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                                className={`h-6 w-11 rounded-full border-2 transition-all relative ${twoFactorEnabled ? 'bg-primary border-primary' : 'bg-transparent border-zinc-700'}`}
                                            >
                                                <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${twoFactorEnabled ? 'right-0.5 bg-background' : 'left-0.5 bg-zinc-700'}`} />
                                            </button>
                                        </div>
                                        {twoFactorEnabled && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="pt-4 border-t border-white/5"
                                            >
                                                <p className="text-xs text-primary font-bold mb-2">✓ Enabled via Authenticator App</p>
                                                <p className="text-[9px] text-zinc-600">Backup codes: 5 remaining</p>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Session Timeout */}
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                                                <Lock size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm">Session Timeout</p>
                                                <p className="text-[9px] text-zinc-500 mt-0.5">Auto-lock after inactivity</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min="5"
                                                max="120"
                                                step="5"
                                                value={sessionTimeout}
                                                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                            />
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-600">5 min</span>
                                                <span className="text-sm font-black text-primary">{sessionTimeout} minutes</span>
                                                <span className="text-xs text-zinc-600">120 min</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auto-Lock */}
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Smartphone size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">Auto-Lock on Device Sleep</p>
                                                    <p className="text-[9px] text-zinc-500 mt-0.5">Lock when device screen turns off</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAutoLockEnabled(!autoLockEnabled)}
                                                className={`h-6 w-11 rounded-full border-2 transition-all relative ${autoLockEnabled ? 'bg-primary border-primary' : 'bg-transparent border-zinc-700'}`}
                                            >
                                                <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${autoLockEnabled ? 'right-0.5 bg-background' : 'left-0.5 bg-zinc-700'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* VPN Required */}
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Wifi size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">Require VPN Connection</p>
                                                    <p className="text-[9px] text-zinc-500 mt-0.5">Block access without secure VPN</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setVpnRequired(!vpnRequired)}
                                                className={`h-6 w-11 rounded-full border-2 transition-all relative ${vpnRequired ? 'bg-primary border-primary' : 'bg-transparent border-zinc-700'}`}
                                            >
                                                <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${vpnRequired ? 'right-0.5 bg-background' : 'left-0.5 bg-zinc-700'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsSecurityOpen(false)}
                                        className="w-full h-12 rounded-xl bg-primary text-background font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} />
                                        Save Settings
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Preferences Modal */}
                <AnimatePresence>
                    {isPreferencesOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsPreferencesOpen(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg max-h-[90vh] bg-background border-2 border-primary/20 rounded-[32px] z-[60] p-8 shadow-2xl overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Preferences</h2>
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Customize Your Experience</p>
                                    </div>
                                    <button onClick={() => setIsPreferencesOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Eye size={18} className="text-primary" />
                                                <div>
                                                    <p className="font-bold text-white text-sm">Dark Mode</p>
                                                    <p className="text-[9px] text-zinc-500 mt-0.5">Always enabled for security</p>
                                                </div>
                                            </div>
                                            <div className="h-6 w-11 rounded-full bg-primary border-2 border-primary relative">
                                                <div className="absolute top-0.5 right-0.5 bottom-0.5 w-4 rounded-full bg-background" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Bell size={18} className="text-primary" />
                                                <div>
                                                    <p className="font-bold text-white text-sm">Sound Effects</p>
                                                    <p className="text-[9px] text-zinc-500 mt-0.5">Audio feedback for actions</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSoundEnabled(!soundEnabled)}
                                                className={`h-6 w-11 rounded-full border-2 transition-all relative ${soundEnabled ? 'bg-primary border-primary' : 'bg-transparent border-zinc-700'}`}
                                            >
                                                <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${soundEnabled ? 'right-0.5 bg-background' : 'left-0.5 bg-zinc-700'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shield size={18} className="text-primary" />
                                                <div>
                                                    <p className="font-bold text-white text-sm">Auto-Scan QR Codes</p>
                                                    <p className="text-[9px] text-zinc-500 mt-0.5">Scan immediately on camera open</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                                                className={`h-6 w-11 rounded-full border-2 transition-all relative ${autoScanEnabled ? 'bg-primary border-primary' : 'bg-transparent border-zinc-700'}`}
                                            >
                                                <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${autoScanEnabled ? 'right-0.5 bg-background' : 'left-0.5 bg-zinc-700'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsPreferencesOpen(false)}
                                        className="w-full h-12 rounded-xl bg-primary text-background font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6"
                                    >
                                        <Check size={16} />
                                        Save Preferences
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <FloatingDock />
            </motion.div>
        </div>
    );
}
