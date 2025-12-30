"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

interface IntroSplashProps {
    onComplete: () => void;
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState<'loading' | 'complete' | 'exit'>('loading');
    const [shouldShow, setShouldShow] = useState(true);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStage('complete');
                    setTimeout(() => {
                        setStage('exit');
                        setTimeout(onComplete, 500);
                    }, 800);
                    return 100;
                }
                return prev + 2;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [onComplete]);

    if (!shouldShow || stage === 'exit') return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
        >
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(124,255,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,255,178,0.1)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse" />
            </div>

            {/* Glowing orb */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-96 h-96 rounded-full bg-primary/20 blur-3xl"
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo with shield */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                    className="relative"
                >
                    <div className="h-24 w-24 rounded-[24px] bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-[0_0_60px_rgba(124,255,178,0.4)]">
                        <Shield size={48} className="text-primary" strokeWidth={2} />
                    </div>

                    {/* Rotating ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-[24px] border-2 border-primary/20 border-t-primary"
                    />
                </motion.div>

                {/* Brand name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <h1 className="text-5xl font-black text-white tracking-tight mb-2">
                        sentinel
                    </h1>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
                        Neural Security Protocol
                    </p>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="w-64"
                >
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full shadow-[0_0_20px_rgba(124,255,178,0.6)]"
                            style={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                            Initializing
                        </span>
                        <span className="text-[9px] font-black text-primary">
                            {progress}%
                        </span>
                    </div>
                </motion.div>

                {/* Status messages */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <AnimatePresence mode="wait">
                        {progress < 30 && (
                            <motion.p
                                key="loading-1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider"
                            >
                                Loading Neural Network...
                            </motion.p>
                        )}
                        {progress >= 30 && progress < 60 && (
                            <motion.p
                                key="loading-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider"
                            >
                                Establishing Secure Link...
                            </motion.p>
                        )}
                        {progress >= 60 && progress < 90 && (
                            <motion.p
                                key="loading-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider"
                            >
                                Verifying Cryptographic Keys...
                            </motion.p>
                        )}
                        {progress >= 90 && stage === 'loading' && (
                            <motion.p
                                key="loading-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[10px] font-bold text-primary uppercase tracking-wider"
                            >
                                System Ready
                            </motion.p>
                        )}
                        {stage === 'complete' && (
                            <motion.p
                                key="complete"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-2 justify-center"
                            >
                                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                                Access Granted
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-3xl" />
            <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/20 rounded-tr-3xl" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/20 rounded-bl-3xl" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/20 rounded-br-3xl" />
        </motion.div>
    );
}
