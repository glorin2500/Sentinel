```javascript
"use client";

import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export function HeroSection() {
    const router = useRouter();
    const { user } = useAuth();
    const [greeting, setGreeting] = useState("Good Evening");
    const [todayScans, setTodayScans] = useState(0);
    const [threatsBlocked, setThreatsBlocked] = useState(0);
    const [safetyScore, setSafetyScore] = useState(100);
    const [loading, setLoading] = useState(true);

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

    // Fetch today's stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !isSupabaseConfigured()) {
                setLoading(false);
                return;
            }

            try {
                // Get start of today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { data: transactions, error } = await supabase
                    .from('transactions')
                    .select('risk_level, risk_score')
                    .eq('user_id', user.id)
                    .gte('created_at', today.toISOString());

                if (!error && transactions) {
                    setTodayScans(transactions.length);
                    
                    // Count threats (warning + danger)
                    const threats = transactions.filter(
                        t => t.risk_level === 'warning' || t.risk_level === 'danger'
                    ).length;
                    setThreatsBlocked(threats);

                    // Calculate safety score (100 - average risk score)
                    if (transactions.length > 0) {
                        const avgRisk = transactions.reduce((sum, t) => sum + (t.risk_score || 0), 0) / transactions.length;
                        setSafetyScore(Math.round(100 - avgRisk));
                    } else {
                        setSafetyScore(100);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [user]);

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

                {/* Quick Stats Preview - Now with REAL data */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-4 mb-6"
                >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Today</p>
                        <p className="text-2xl font-black text-white">
                            {loading ? "..." : todayScans}
                        </p>
                        <p className="text-xs text-zinc-400">Scans</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Blocked</p>
                        <p className="text-2xl font-black text-primary">
                            {loading ? "..." : threatsBlocked}
                        </p>
                        <p className="text-xs text-zinc-400">Threats</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Safety</p>
                        <p className="text-2xl font-black text-white">
                            {loading ? "..." : `${ safetyScore }% `}
                        </p>
                        <p className="text-xs text-zinc-400">Score</p>
                    </div>
                </motion.div>

                {/* Status Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-6"
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
