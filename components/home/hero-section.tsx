import { motion } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { Scan, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hapticClick } from "@/lib/haptic";

export function HeroSection() {
    const { safetyScore } = useSentinelStore();
    const router = useRouter();
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20"
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-primary/10"
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/30 rounded-full"
                    style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                    }}
                    animate={{
                        y: [-10, 10, -10],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                    }}
                />
            ))}

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <Sparkles size={20} className="text-primary" />
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">
                            {greeting}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight"
                    >
                        Welcome to Sentinel
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm sm:text-base text-zinc-400 max-w-xl"
                    >
                        Your AI-powered guardian against UPI fraud. Stay protected with real-time threat detection.
                    </motion.p>

                    {/* Safety Score Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${safetyScore >= 80 ? 'bg-primary' : safetyScore >= 60 ? 'bg-yellow-500' : 'bg-destructive'} animate-pulse`} />
                            <span className="text-xs font-bold text-zinc-400">Safety Score</span>
                        </div>
                        <span className={`text-lg font-black ${safetyScore >= 80 ? 'text-primary' : safetyScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                            {safetyScore}%
                        </span>
                    </motion.div>
                </div>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        hapticClick();
                        router.push('/scan');
                    }}
                    className="group relative px-6 py-4 rounded-2xl bg-primary text-background font-black uppercase tracking-wider text-sm flex items-center gap-3 shadow-[0_0_40px_rgba(124,255,178,0.3)] hover:shadow-[0_0_60px_rgba(124,255,178,0.4)] transition-all"
                >
                    <Scan size={20} className="group-hover:rotate-12 transition-transform" />
                    Quick Scan
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />

                    {/* Pulsing ring */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.button>
            </div>
        </motion.div>
    );
}
