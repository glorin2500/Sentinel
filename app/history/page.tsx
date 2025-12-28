"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useSentinelStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldAlert, Clock, Search, MapPin, CreditCard, ChevronRight, Hash } from "lucide-react";

export default function HistoryPage() {
    const { scans } = useSentinelStore();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-10 pt-12 pb-32 px-4"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Audit Log</h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Neural Verification History</p>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative h-14 w-full md:w-64 bg-white/5 rounded-2xl border border-white/10 flex items-center px-5 gap-4 backdrop-blur-xl group-focus-within:border-primary/40 transition-all">
                        <Search size={18} className="text-zinc-600 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search UPI ID..."
                            className="bg-transparent border-none outline-none text-sm font-bold text-white w-full placeholder:text-zinc-700"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {scans.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.02] rounded-[40px] p-20 text-center border border-dashed border-white/5"
                        >
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-zinc-700">
                                <Clock size={40} />
                            </div>
                            <p className="text-zinc-500 font-black uppercase text-xs tracking-[0.2em]">Zero Activity Detected</p>
                            <p className="text-zinc-700 text-[10px] mt-2 font-bold uppercase tracking-widest">Connect your first node to begin monitoring</p>
                        </motion.div>
                    ) : (
                        scans.map((scan, i) => (
                            <motion.div
                                key={scan.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, type: "spring", damping: 20, stiffness: 100 }}
                            >
                                <GlassCard className="group flex-col md:flex-row items-stretch p-0 overflow-hidden border-white/5 hover:border-white/10 transition-all !bg-white/[0.01]">
                                    {/* Link Indicator Area */}
                                    <div className={`w-2 shrink-0 ${scan.status === 'safe' ? 'bg-primary/40' : 'bg-destructive/40'}`} />

                                    <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-8">
                                        <div className={`h-20 w-20 shrink-0 rounded-3xl flex items-center justify-center border-2 transition-all group-hover:scale-105 ${scan.status === 'safe'
                                                ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_30px_rgba(124,255,178,0.1)]'
                                                : 'bg-destructive/10 border-destructive/20 text-destructive shadow-[0_0_30px_rgba(255,107,107,0.1)]'
                                            }`}>
                                            {scan.status === 'safe' ? <CheckCircle2 size={36} strokeWidth={2.5} /> : <ShieldAlert size={36} strokeWidth={2.5} />}
                                        </div>

                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <div>
                                                <h3 className="font-black text-white text-2xl tracking-tight group-hover:text-primary transition-colors uppercase">{scan.upiId}</h3>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <CreditCard size={12} className="text-zinc-600" />
                                                        {scan.merchantName || "Unlabeled Node"}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} className="text-zinc-700" />
                                                        {new Date(scan.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocol</p>
                                                    <p className="text-xs font-bold text-zinc-300 uppercase italic">AES-256 Verified</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Location</p>
                                                    <p className="text-xs font-bold text-zinc-300 flex items-center justify-center md:justify-start gap-1">
                                                        <MapPin size={10} className="text-zinc-500" /> IN_WEST_MUM
                                                    </p>
                                                </div>
                                                <div className="space-y-1 hidden md:block">
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Neural Hash</p>
                                                    <p className="text-xs font-bold text-zinc-300 flex items-center gap-1 font-mono">
                                                        <Hash size={10} className="text-zinc-500" /> {scan.id.substring(0, 6)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex flex-col items-center md:items-end justify-between gap-6 self-stretch md:border-l border-white/5 md:pl-8">
                                            <div className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.2em] border-2 ${scan.status === 'safe'
                                                    ? 'bg-primary/20 border-primary/20 text-primary'
                                                    : 'bg-destructive/20 border-destructive/20 text-destructive shadow-[0_4px_20px_rgba(255,107,107,0.2)]'
                                                }`}>
                                                {scan.status === 'safe' ? 'IDENTITY_SECURE' : 'THREAT_LOGGED'}
                                            </div>
                                            <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all group-hover:translate-x-1">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
