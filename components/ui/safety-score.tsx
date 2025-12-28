"use client";

import { GlassCard } from "./glass-card";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { motion } from "framer-motion";
import { useSentinelStore } from "@/lib/store";

export function SafetyScore() {
    const { safetyScore } = useSentinelStore();

    const data = [
        {
            name: "Safety",
            value: safetyScore,
            fill: "#7CFFB2",
        },
    ];

    return (
        <GlassCard className="h-[400px] flex flex-col justify-between group">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Safety Score</h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Overall Protection</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden py-4">
                {/* Radar Sweep Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-primary/20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-primary/10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full border border-primary/5" />
                    {/* Rotating Scanner Line */}
                    <div className="absolute top-1/2 left-1/2 w-[140px] h-[140px] -ml-[140px] -mt-[140px] origin-bottom-right animate-radar">
                        <div className="w-full h-full bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/20 rounded-tl-full" />
                    </div>
                </div>

                {/* Chart */}
                <div className="w-full h-full absolute inset-0 z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="75%"
                            outerRadius="95%"
                            barSize={24}
                            data={data}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <RadialBar
                                background={{ fill: 'rgba(255,255,255,0.05)' }}
                                dataKey="value"
                                cornerRadius={12}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>

                {/* Center Content */}
                <div className="z-20 flex flex-col items-center">
                    <motion.span
                        key={safetyScore}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-black text-primary tracking-tighter"
                    >
                        {safetyScore}%
                    </motion.span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Trust Score</span>
                </div>
            </div>

            {/* Sub Cards - Better Readability */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.08] transition-all cursor-pointer group"
                >
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Verified</span>
                    <span className="text-2xl font-black text-white">452</span>
                </motion.div>
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.08] transition-all cursor-pointer group"
                >
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Caution</span>
                    <span className="text-2xl font-black text-destructive">12</span>
                </motion.div>
            </div>
        </GlassCard>
    );
}
