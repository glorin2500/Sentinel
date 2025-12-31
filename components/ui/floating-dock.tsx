"use client";

import { motion } from "framer-motion";
import { Home, History, BarChart3, User, ScanLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function FloatingDock() {
    const pathname = usePathname();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: History, label: "History", href: "/history" },
        // Center spacing for QR button
        { icon: null, label: "Scan", href: "/scan", isCenter: true },
        { icon: BarChart3, label: "Analytics", href: "/analytics" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                className="pointer-events-auto flex items-center gap-1 px-4 py-3 rounded-[32px] bg-[#0E1211]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
                {navItems.map((item, index) => {
                    if (item.isCenter) {
                        return (
                            <div key="scan-btn" className="relative mx-1">
                                <Link href="/scan">
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onHoverStart={() => setHoveredIndex(index)}
                                        onHoverEnd={() => setHoveredIndex(null)}
                                        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-[0_0_30px_rgba(124,255,178,0.4)] text-[#0B0F0E] group"
                                    >
                                        <ScanLine size={26} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />

                                        {/* Pulsing ring */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="absolute inset-0 rounded-full border-2 border-primary"
                                        />
                                    </motion.button>
                                </Link>

                                {/* Tooltip */}
                                {hoveredIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-primary text-background text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-lg"
                                    >
                                        {item.label}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-primary" />
                                    </motion.div>
                                )}
                            </div>
                        );
                    }

                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onHoverStart={() => setHoveredIndex(index)}
                                onHoverEnd={() => setHoveredIndex(null)}
                                className={cn(
                                    "relative p-3 rounded-2xl transition-all duration-300",
                                    isActive
                                        ? "text-primary bg-primary/10 shadow-[0_0_20px_rgba(124,255,178,0.2)]"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                {item.icon && <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />}

                                {/* Active indicator dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                {/* Tooltip */}
                                {hoveredIndex === index && !isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg"
                                    >
                                        {item.label}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white/10 border-r border-b border-white/20" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
}
