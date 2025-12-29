"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

export function IntroSplash({ onComplete }: { onComplete: () => void }) {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExit(true);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={exit ? { opacity: 0, pointerEvents: "none" } : { opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0F0E]"
        >
            <div className="flex flex-col items-center gap-4">
                {/* Logo Pulse */}
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                    />
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="relative h-20 w-20 bg-primary rounded-[24px] flex items-center justify-center text-[#0B0F0E] shadow-[0_0_40px_rgba(124,255,178,0.3)]"
                    >
                        <ShieldCheck size={40} strokeWidth={2.5} />
                    </motion.div>
                </div>

                {/* Text Reveal */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">sentinel</h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="h-0.5 bg-primary/50 mx-auto rounded-full mb-2"
                    />
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Fraud Detection System</p>
                </motion.div>
            </div>
        </motion.div>
    );
}
