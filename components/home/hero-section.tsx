import { motion } from "framer-motion";
import { Scan, ArrowRight, Sparkles, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hapticClick } from "@/lib/haptic";
import { useAuth } from "@/lib/auth-context";
import { TransactionService } from "@/lib/services/transaction-service";

export function HeroSection() {
    const { user } = useAuth();
    const router = useRouter();
    const [greeting, setGreeting] = useState("");
    const [safetyScore, setSafetyScore] = useState(100);

    useEffect(() => {
        // Update greeting based on current time
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("Good Morning");
            else if (hour < 17) setGreeting("Good Afternoon");
            else setGreeting("Good Evening");
        };

        updateGreeting();
        // Update greeting every minute
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch real safety score
        if (user) {
            TransactionService.getTransactionStats(user.id).then(stats => {
                if (stats.total === 0) {
                    setSafetyScore(100);
                    return;
                }

                const safeWeight = stats.safe * 100;
                const cautionWeight = stats.caution * 75;
                const warningWeight = stats.warning * 50;
                const dangerWeight = stats.danger * 0;

                const totalWeight = safeWeight + cautionWeight + warningWeight + dangerWeight;
                setSafetyScore(Math.round(totalWeight / stats.total));
            });
        }
    }, [user]);

    const userName = user?.email?.split('@')[0] || 'Guardian';

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
                    }}
                />
            ))}

            <div className="relative z-10">
                {/* Greeting */}
                <div className="mb-6">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl font-black text-white mb-2"
                    >
                        {greeting}, <span className="text-primary capitalize">{userName}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-400 text-sm sm:text-base"
                    >
                        Your fraud protection is <span className="text-primary font-bold">active</span>
                    </motion.p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={16} className="text-primary" />
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Safety Score</span>
                        </div>
                        <div className="text-2xl font-black text-white">{safetyScore}</div>
                        <div className="text-xs text-zinc-400">/ 100</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={16} className="text-primary" />
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</span>
                        </div>
                        <div className="text-2xl font-black text-primary">Protected</div>
                        <div className="text-xs text-zinc-400">Real-time</div>
                    </motion.div>
                </div>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => {
                        hapticClick();
                        router.push('/scan');
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-black font-black rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
                >
                    <Scan size={18} className="group-hover:rotate-12 transition-transform" />
                    Scan Transaction
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>
        </motion.div>
    );
}
