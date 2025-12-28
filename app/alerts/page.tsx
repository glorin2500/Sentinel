"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldCheck, Mail, Smartphone, AlertCircle, Check, Activity, Terminal, ShieldAlert } from "lucide-react";

export default function AlertsPage() {
    const [settings, setSettings] = useState({
        push: true,
        email: false,
        critical: true,
        weekly: true
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-12 pt-12 pb-32 px-4"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                    <Activity size={16} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Monitoring: ACTIVE</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Security Center</h1>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Protocol & notification management</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Configuration Hub */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <Terminal size={18} className="text-zinc-500" />
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Divergence Protocols</h3>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { id: 'push', label: 'Push Alerts', icon: Smartphone, desc: 'Real-time threat interception' },
                                { id: 'email', label: 'Vault Logs', icon: Mail, desc: 'Weekly cryptographic reports' },
                                { id: 'critical', label: 'Auto-Block', icon: ShieldCheck, desc: 'Instant neutralization of threats' },
                                { id: 'weekly', label: 'Health Brief', icon: Bell, desc: 'Security score summaries' }
                            ].map((item) => (
                                <GlassCard
                                    key={item.id}
                                    onClick={() => toggle(item.id as any)}
                                    className={`flex-col items-start p-8 cursor-pointer transition-all duration-500 border-2 ${settings[item.id as keyof typeof settings]
                                            ? 'border-primary/40 !bg-primary/[0.03]'
                                            : 'border-white/5 !bg-white/[0.01] grayscale opacity-60'
                                        }`}
                                >
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${settings[item.id as keyof typeof settings] ? 'bg-primary/20 text-primary scale-110' : 'bg-white/5 text-zinc-600'
                                        }`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-white">{item.label}</p>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.desc}</p>
                                    </div>

                                    <div className={`mt-8 h-1 w-full rounded-full transition-all duration-700 ${settings[item.id as keyof typeof settings] ? 'bg-primary' : 'bg-zinc-800'
                                        }`} />
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Status Side Panel */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldAlert size={18} className="text-destructive" />
                        <h3 className="text-xs font-black text-destructive uppercase tracking-widest">Critical Feed</h3>
                    </div>

                    <div className="space-y-4">
                        <GlassCard className="p-8 border-destructive/30 bg-destructive/5 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 text-destructive/10 group-hover:scale-150 transition-transform duration-1000">
                                <AlertCircle size={80} />
                            </div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase">Neural Patch 7.4</p>
                                    <p className="text-[10px] font-bold text-destructive/80 mt-1 uppercase tracking-widest">Urgent Installation</p>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-zinc-400 leading-relaxed relative z-10">
                                Detects new UPI redirection phishing attempts spreading in your region.
                            </p>
                            <button className="w-full py-4 rounded-2xl bg-destructive text-white font-black uppercase text-[10px] tracking-[0.3em] hover:opacity-90 transition-all relative z-10 shadow-[0_10px_30px_rgba(239,68,68,0.2)]">
                                Install Now
                            </button>
                        </GlassCard>

                        <GlassCard className="p-8 border-primary/20 bg-primary/5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <Check size={20} />
                                </div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">AES-256 Active</p>
                            </div>
                            <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="w-1/3 h-full bg-primary"
                                />
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
