"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { IntroSplash } from "@/components/ui/intro-splash";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, User, Shield, Bell, LogOut } from "lucide-react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (window as any).toggleAccountPanel = () => setIsAccountOpen(prev => !prev);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pb-32">
            <AnimatePresence>
                {isLoading && <IntroSplash onComplete={() => setIsLoading(false)} />}
            </AnimatePresence>

            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Background Gradients for depth */}
                    <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none rounded-full -translate-y-1/2" />

                    {/* Header */}
                    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-8 px-3 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-background font-black text-[10px] tracking-tighter">sentinel</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => (window as any).toggleAccountPanel?.()}
                                className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-black hover:scale-110 active:scale-95 transition-all"
                            >
                                L
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="pt-20 px-4 md:px-6 max-w-7xl mx-auto">
                        {children}
                    </main>

                    {/* Account Panel Overlay */}
                    <AnimatePresence>
                        {isAccountOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsAccountOpen(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                                />
                                <motion.div
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed top-0 right-0 h-full w-full max-w-[320px] bg-background border-l border-white/10 z-[60] p-8 shadow-2xl"
                                >
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Account</h2>
                                        <button onClick={() => setIsAccountOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                                            <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl font-bold border border-indigo-500/30">L</div>
                                            <div>
                                                <p className="font-black text-white">OPERATOR_01</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Verified Identity</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            {[
                                                { icon: User, label: "Edit Profile", href: "/profile" },
                                                { icon: Shield, label: "Security Settings" },
                                                { icon: Bell, label: "Preferences" },
                                                { icon: LogOut, label: "Log Out", color: "text-red-400" }
                                            ].map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => item.href && router.push(item.href)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group ${item.color || "text-zinc-400"}`}
                                                >
                                                    <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold group-hover:text-white transition-colors">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="absolute bottom-12 left-8 right-8">
                                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                                <p className="text-[10px] font-black text-primary tracking-widest mb-2">sentinel v9.5</p>
                                                <p className="text-xs font-medium text-zinc-500 leading-relaxed">System is running in optimized state. All neural links active.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <FloatingDock />
                </motion.div>
            )}
        </div>
    );
}
