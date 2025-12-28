"use client";

import { motion } from "framer-motion";
import { LayoutGrid, ShieldAlert, CreditCard, Settings, Bell, Search, User } from "lucide-react";
import Image from "next/image";

export function Sidebar() {
    const menuItems = [
        { icon: LayoutGrid, label: "Dashboard", active: true },
        { icon: ShieldAlert, label: "Risk Analysis", active: false },
        { icon: CreditCard, label: "Cards", active: false },
        { icon: Settings, label: "Settings", active: false },
    ];

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:flex flex-col w-20 lg:w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-background/50 backdrop-blur-xl z-50 py-8 px-4"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-background font-bold text-lg">S</span>
                </div>
                <span className="text-lg font-bold text-white hidden lg:block tracking-wide">Sentinel</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${item.active
                                ? "bg-primary text-background font-medium shadow-[0_0_20px_rgba(124,255,178,0.2)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <item.icon size={20} />
                        <span className="hidden lg:block text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User */}
            <div className="mt-auto">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-left">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        L
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Leandro</p>
                        <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}

export function MobileNav() {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#1A2220]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-around px-2 z-50 shadow-2xl"
        >
            <button className="p-3 text-primary"><LayoutGrid size={24} /></button>
            <button className="p-3 text-muted-foreground"><ShieldAlert size={24} /></button>
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center -mt-8 border-4 border-background shadow-lg">
                <Search size={20} className="text-background" />
            </div>
            <button className="p-3 text-muted-foreground"><CreditCard size={24} /></button>
            <button className="p-3 text-muted-foreground"><User size={24} /></button>
        </motion.div>
    )
}
