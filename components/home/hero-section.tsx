"use client";

import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function HeroSection() {
    const router = useRouter();
    const [greeting, setGreeting] = useState("Good Evening");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Good Morning");
        } else if (hour < 18) {
            setGreeting("Good Afternoon");
        } else {
            setGreeting("Good Evening");
        }
    }, []);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8"
        >
            {/* Animated background glow */}
            <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10">
                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <p className="text-sm text-zinc-400 uppercase tracking-wider mb-2">
                        {greeting}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                        Stay Protected
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Your personal fraud detection shield
                    </p>
                </motion.div>

                {/* Quick Scan Button */}
                <motion.button
                    onClick={() => router.push('/scan')}
                    className="relative group px-8 py-4 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all flex items-center gap-3 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    <Zap size={20} className="relative z-10" />
                    <span className="relative z-10">Scan Now</span>
                </motion.button>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 flex items-center gap-6"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm text-zinc-400">System Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        <span className="text-sm text-zinc-400">Protected</span>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}
