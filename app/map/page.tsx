"use client";

import DynamicMap from "@/components/map/dynamic-map";
import Shell from "@/components/layout/shell";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
    return (
        <Shell>
            <div className="absolute inset-0 z-0 bg-[#050510]">
                <DynamicMap />

                {/* Overlaid Title for context (optional, but good for UX) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 sm:opacity-100">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                    >
                        <span className="text-white text-sm font-bold tracking-wider uppercase">Live Threat Map</span>
                    </motion.div>
                </div>
            </div>
        </Shell>
    );
}
