"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { useSentinelStore } from "@/lib/store";

export function BiometricGate() {
    const { isAuthenticated, setAuthenticated } = useSentinelStore();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [accessGranted, setAccessGranted] = useState(false);

    const handleStartScan = () => {
        if (!isScanning && !accessGranted) {
            setIsScanning(true);
        }
    };

    const handleEndScan = () => {
        if (!accessGranted) {
            setIsScanning(false);
            setScanProgress(0);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isScanning && !accessGranted) {
            interval = setInterval(() => {
                setScanProgress((prev) => {
                    if (prev >= 100) {
                        setAccessGranted(true);
                        setIsScanning(false);
                        setTimeout(() => {
                            setAuthenticated(true);
                        }, 1200);
                        return 100;
                    }
                    return prev + 3; // Faster scan
                });
            }, 20);
        } else {
            setScanProgress(0);
        }
        return () => clearInterval(interval);
    }, [isScanning, accessGranted, setAuthenticated]);

    if (isAuthenticated) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-zinc-900 to-black flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/30 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            y: [null, Math.random() * window.innerHeight],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">

                {/* Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-3"
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 mb-2"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(124,255,178,0.2)",
                                "0 0 40px rgba(124,255,178,0.4)",
                                "0 0 20px rgba(124,255,178,0.2)",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ShieldCheck size={32} className="text-primary" />
                    </motion.div>

                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Sentinel
                    </h1>
                    <p className="text-sm text-zinc-400">Fraud Detection Shield</p>
                </motion.div>

                {/* Fingerprint Scanner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative group cursor-pointer"
                    onMouseDown={handleStartScan}
                    onMouseUp={handleEndScan}
                    onTouchStart={handleStartScan}
                    onTouchEnd={handleEndScan}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Outer Glow Rings */}
                    <AnimatePresence>
                        {isScanning && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, scale: 1 }}
                                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1.8] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 1 }}
                                    animate={{ opacity: [0, 0.3, 0], scale: [1, 1.8, 2.2] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                                    className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Scanner Circle */}
                    <div
                        className={`relative w-40 h-40 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${accessGranted
                            ? "bg-gradient-to-br from-primary/30 to-primary/10 border-primary shadow-[0_0_60px_rgba(124,255,178,0.6)]"
                            : isScanning
                                ? "bg-gradient-to-br from-white/10 to-white/5 border-primary/60 shadow-[0_0_40px_rgba(124,255,178,0.3)]"
                                : "bg-gradient-to-br from-white/5 to-transparent border-white/20 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(124,255,178,0.2)]"
                            }`}
                    >
                        {/* Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="76"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                className="text-primary/20"
                            />
                            <motion.circle
                                cx="80"
                                cy="80"
                                r="76"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 76}
                                strokeDashoffset={2 * Math.PI * 76 * (1 - scanProgress / 100)}
                                className="text-primary"
                                style={{ transition: "stroke-dashoffset 0.1s linear" }}
                            />
                        </svg>

                        {/* Fingerprint Icon */}
                        <div className="relative z-10">
                            <motion.div
                                animate={
                                    isScanning
                                        ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }
                                        : {}
                                }
                                transition={{ duration: 0.5, repeat: isScanning ? Infinity : 0 }}
                            >
                                <Fingerprint
                                    size={64}
                                    className={`transition-colors duration-300 ${accessGranted
                                        ? "text-primary"
                                        : isScanning
                                            ? "text-primary/80"
                                            : "text-white/40"
                                        }`}
                                    strokeWidth={1.5}
                                />
                            </motion.div>
                        </div>

                        {/* Scanning Beam */}
                        {isScanning && !accessGranted && (
                            <motion.div
                                className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(124,255,178,0.8)]"
                                initial={{ top: "20%" }}
                                animate={{ top: ["20%", "80%", "20%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Status Text */}
                <div className="h-16 flex flex-col items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                        {accessGranted ? (
                            <motion.div
                                key="granted"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles size={16} />
                                    <span className="text-base font-black uppercase tracking-wider">
                                        Access Granted
                                    </span>
                                    <Sparkles size={16} />
                                </div>
                                <p className="text-xs text-zinc-500">Welcome back!</p>
                            </motion.div>
                        ) : isScanning ? (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="flex items-center gap-2 text-primary">
                                    <Zap size={14} className="animate-pulse" />
                                    <span className="text-sm font-bold uppercase tracking-wider">
                                        Verifying
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500">{scanProgress}% Complete</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Tap & Hold
                                </span>
                                <p className="text-xs text-zinc-600">to unlock</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-xs text-zinc-700 text-center max-w-xs"
                >
                    Secure biometric authentication • End-to-end encrypted
                </motion.p>
            </div>

            {/* Bottom Branding */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-0 right-0 flex justify-center"
            >
                <div className="text-[10px] font-mono text-zinc-800 text-center">
                    SENTINEL SECURITY SYSTEM v3.0
                    <br />
                    BIOMETRIC AUTHENTICATION ACTIVE
                </div>
            </motion.div>
        </motion.div>
    );
}
