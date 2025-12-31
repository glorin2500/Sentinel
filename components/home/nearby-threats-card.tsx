"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Map, Navigation, Shield, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";

export function NearbyThreatsCard() {
    const router = useRouter();

    return (
        <GlassCard className="group cursor-pointer relative overflow-hidden" hoverEffect={false}>
            <div
                onClick={() => {
                    hapticClick();
                    router.push('/map');
                }}
                className="absolute inset-0 z-10"
            />

            {/* Background Map Effect */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>

            <div className="relative z-20 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Map size={18} />
                        </div>
                        <span className="font-bold text-white">Nearby Activity</span>
                    </div>
                    <span className="text-xs font-bold text-primary animate-pulse">LIVE</span>
                </div>

                <div className="flex-1 flex items-center justify-center relative my-2">
                    {/* Radar Effect */}
                    <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite]" />
                    <div className="absolute w-24 h-24 rounded-full border border-primary/30" />

                    {/* Center User */}
                    <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10" />

                    {/* Nearby Markers */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute top-1/4 right-1/4"
                    >
                        <AlertTriangle size={16} className="text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-1/3 left-1/4"
                    >
                        <Shield size={16} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </motion.div>
                </div>

                <div className="mt-auto">
                    <p className="text-sm text-zinc-400 mb-2">
                        <span className="text-white font-bold">3 Risky Merchants</span> detected within 2km radius.
                    </p>
                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                        View Full Map <Navigation size={12} />
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
