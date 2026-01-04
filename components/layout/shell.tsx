"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { IntroSplash } from "@/components/ui/intro-splash";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, User, Shield, Bell, LogOut, Lock, Key, Smartphone, Wifi, Eye, EyeOff, Check, Sun, Moon, AlertTriangle } from "lucide-react";
import { useSentinelStore } from "@/lib/store";
import { BiometricGate } from "@/components/auth/biometric-gate";
import { useAuth } from "@/lib/auth-context";

export default function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const router = useRouter();
    const { userProfile, isAuthenticated, setAuthenticated, isSplashComplete, setSplashComplete } = useSentinelStore();
    const { user, signOut } = useAuth();

    // Security settings state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [autoLockEnabled, setAutoLockEnabled] = useState(true);

    // Preferences state
    const [darkMode, setDarkMode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);

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

    // 3. Main Dashboard - render children
    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pb-32">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Enhanced Header */}
                <motion.header
                    className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black via-black/95 to-black/80 backdrop-blur-xl border-b border-primary/20"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                >
                    {/* Logo */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <motion.div
                            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30"
                            animate={{
                                boxShadow: [
                                    "0 0 20px rgba(124,255,178,0.2)",
                                    "0 0 30px rgba(124,255,178,0.4)",
                                    "0 0 20px rgba(124,255,178,0.2)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Shield size={20} className="text-primary" />
                        </motion.div>
                        <div>
                            <h1 className="text-lg font-black text-white tracking-tight">Sentinel</h1>
                            <p className="text-[10px] text-zinc-500 font-medium">FRAUD SHIELD</p>
                        </div>
                    </motion.div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 flex items-center justify-center transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Bell size={18} className="text-zinc-400" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </motion.button>

                        <motion.button
                            onClick={() => setIsAccountOpen(true)}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center hover:border-primary/50 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <User size={18} className="text-primary" />
                        </motion.button>
                    </div>
                </motion.header>

                {/* Main Content - ALWAYS render children */}
                <main className="pt-20 px-4 sm:px-6 max-w-7xl mx-auto">
                    {children}
                </main>

                {/* Floating Dock Navigation */}
                <FloatingDock />

                {/* Account Panel (existing code...) */}
                {/* ... rest of your panels ... */}
            </motion.div>
        </div>
    );
}
