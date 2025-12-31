import { motion } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { Shield, TrendingUp, Zap, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";

export function StatsOverview() {
    const { scans, safetyScore, gamification } = useSentinelStore();
    const router = useRouter();

    // Calculate stats
    const thisMonthScans = scans.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        const now = new Date();
        return scanDate.getMonth() === now.getMonth() &&
            scanDate.getFullYear() === now.getFullYear();
    }).length;

    const threatsBlocked = scans.filter(s => s.status === 'risky').length;
    const safeScanPercentage = scans.length > 0
        ? Math.round((scans.filter(s => s.status === 'safe').length / scans.length) * 100)
        : 0;

    const stats = [
        {
            icon: Target,
            label: "Scans This Month",
            value: thisMonthScans,
            trend: "+12%",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
            action: () => router.push('/history')
        },
        {
            icon: Shield,
            label: "Safety Score",
            value: `${safetyScore}%`,
            trend: safetyScore >= 80 ? "Excellent" : "Good",
            color: "text-primary",
            bg: "bg-primary/10",
            glow: "shadow-[0_0_20px_rgba(124,255,178,0.15)]",
            action: () => router.push('/analytics')
        },
        {
            icon: Zap,
            label: "Threats Blocked",
            value: threatsBlocked,
            trend: "All time",
            color: "text-destructive",
            bg: "bg-destructive/10",
            glow: "shadow-[0_0_20px_rgba(255,107,107,0.15)]",
            action: () => router.push('/analytics')
        },
        {
            icon: TrendingUp,
            label: "Current Streak",
            value: `${gamification.currentStreak}d`,
            trend: `Best: ${gamification.longestStreak}d`,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",
            action: () => router.push('/education')
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        hapticClick();
                        stat.action();
                    }}
                    className={`relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all cursor-pointer group ${stat.glow}`}
                >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${stat.bg} blur-xl`} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl sm:text-3xl font-black text-white">
                                {stat.value}
                            </p>
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400">
                                {stat.label}
                            </p>
                        </div>
                    </div>

                    {/* Animated border */}
                    <motion.div
                        className={`absolute inset-0 rounded-2xl border-2 ${stat.color.replace('text-', 'border-')} opacity-0 group-hover:opacity-20`}
                        initial={false}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            ))}
        </div>
    );
}
