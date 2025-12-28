"use client";

import { motion } from "framer-motion";
import { Home, History, Bell, User, ScanLine, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export function FloatingDock() {
    const pathname = usePathname();
    const [isScanOpen, setIsScanOpen] = useState(false);

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: History, label: "History", href: "/history" },
        // Center spacing for QR button
        { icon: null, label: "Scan", href: "/scan", isCenter: true },
        { icon: Bell, label: "Analytics", href: "/analytics" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-[32px] bg-[#0E1211]/90 backdrop-blur-md border border-white/5 shadow-2xl"
            >
                {navItems.map((item, index) => {
                    if (item.isCenter) {
                        return (
                            <div key="scan-btn" className="relative mx-2">
                                <Link href="/scan">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(124,255,178,0.3)] text-[#0B0F0E]"
                                    >
                                        <ScanLine size={24} strokeWidth={2.5} />
                                    </motion.button>
                                </Link>
                            </div>
                        );
                    }

                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative p-3 rounded-full transition-all duration-300",
                                    isActive ? "text-primary bg-white/5" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {item.icon && <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />}
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
}
