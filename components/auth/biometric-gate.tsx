"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Lock, Unlock, ShieldCheck, Zap } from "lucide-react";
import { useSentinelStore } from "@/lib/store";

export function BiometricGate() {
    const { isAuthenticated, setAuthenticated } = useSentinelStore();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [accessGranted, setAccessGranted] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Reset auth on mount (optional - for demo purposes we might want to persist session)
    // But for "app" feel, let's keep it checking state.

    const handleStartScan = () => {
        if (!isScanning && !accessGranted) {
            setIsScanning(true);
            setShowHint(false);
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
                        }, 1500); // Wait for success animation
                        return 100;
                    }
                    return prev + 2; // Speed of scan
                });
            }, 20);
        } else {
            setScanProgress(0);
        }
        return () => clearInterval(interval);
    }, [isScanning, accessGranted, setAuthenticated]);

    // Hint timer
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isAuthenticated) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Central Scanner */}
            <div className="relative z-10 flex flex-col items-center gap-12 max-w-sm w-full">

                {/* Header Text */}
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 mb-2"
                    >
                        <Lock size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500">
                            System Locked
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-black text-white tracking-widest uppercase"
                    >
                        Sentinel
                    </motion.h1>
                </div>

                {/* Fingerprint Sensor */}
                <motion.div
                    className="relative group cursor-pointer"
                    onMouseDown={handleStartScan}
                    onMouseUp={handleEndScan}
                    onTouchStart={handleStartScan}
                    onTouchEnd={handleEndScan}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Ripple Effects when scanning */}
                    {isScanning && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: 0, scale: 2 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="absolute inset-0 rounded-full bg-primary/20"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                className="absolute inset-0 rounded-full bg-primary/10"
                            />
                        </>
                    )}

                    {/* Scanner Container */}
                    <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${accessGranted
                            ? "bg-primary/20 border-primary shadow-[0_0_50px_rgba(124,255,178,0.5)]"
                            : isScanning
                                ? "bg-white/10 border-primary/50 shadow-[0_0_30px_rgba(124,255,178,0.2)]"
                                : "bg-white/5 border-white/10 hover:border-white/30"
                        }`}>
                        {/* Fingerprint Icon with Mask effect for scanning progress */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 text-white/20">
                            <Fingerprint className="w-full h-full" strokeWidth={1} />

                            {/* Color Overlay based on progress */}
                            <div
                                className="absolute inset-0 overflow-hidden text-primary transition-all duration-75"
                                style={{ height: `${scanProgress}%` }}
                            >
                                <Fingerprint className="w-full h-full" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Scanner Beam */}
                        {isScanning && !accessGranted && (
                            <motion.div
                                className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_#7cffb2]"
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        )}

                        {/* Success Icon */}
                        <AnimatePresence>
                            {accessGranted && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm"
                                >
                                    <ShieldCheck size={40} className="text-primary" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Status / Instruction */}
                <div className="h-12 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {accessGranted ? (
                            <motion.div
                                key="granted"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-primary"
                            >
                                <Unlock size={16} />
                                <span className="text-sm font-black uppercase tracking-widest">Access Granted</span>
                            </motion.div>
                        ) : isScanning ? (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-primary text-xs font-bold uppercase tracking-widest animate-pulse"
                            >
                                Verifying Biometrics... {scanProgress}%
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-zinc-500 text-xs font-bold uppercase tracking-widest"
                            >
                                Hold to Unlock
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Tech Decors */}
            <div className="absolute bottom-10 left-0 right-0 px-10 flex justify-between items-end opacity-50">
                <div className="flex flex-col gap-1">
                    <div className="w-20 h-[2px] bg-zinc-800" />
                    <div className="w-10 h-[2px] bg-zinc-800 align-left" />
                </div>
                <div className="text-[8px] font-mono text-zinc-700 text-right">
                    SECURE CONNECTION RA-9<br />
                    BIOMETRIC GATE v2.4
                </div>
            </div>
        </motion.div>
    );
}
