"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useSentinelStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldAlert, Clock, Search, MapPin, CreditCard, ChevronRight, Hash, Filter, ArrowUpDown, TrendingUp, AlertTriangle, ShieldCheck, X, Star } from "lucide-react";
import { ExportMenu } from "@/components/ui/export-menu";

export default function HistoryPage() {
    const { scans, favorites, isFavorite } = useSentinelStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'risky'>('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortMode, setSortMode] = useState<'TIME' | 'UPI' | 'STATUS'>('TIME');

    // Filter and sort scans
    const filteredScans = scans
        .filter(scan => {
            const matchesSearch = scan.upiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scan.merchantName?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
            const matchesFavorites = !showFavoritesOnly || isFavorite(scan.upiId);
            return matchesSearch && matchesStatus && matchesFavorites;
        })
        .sort((a, b) => {
            if (sortMode === 'STATUS') return a.status.localeCompare(b.status);
            if (sortMode === 'UPI') return a.upiId.localeCompare(b.upiId);
            return b.timestamp - a.timestamp; // TIME - newest first
        });

    const riskyCount = scans.filter(s => s.status === 'risky').length;
    const safeCount = scans.filter(s => s.status === 'safe').length;
    const totalScans = scans.length;

    const cycleSort = () => {
        const modes: typeof sortMode[] = ['TIME', 'UPI', 'STATUS'];
        const next = modes[(modes.indexOf(sortMode) + 1) % modes.length];
        setSortMode(next);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto space-y-6 pt-8 pb-32 px-4"
        >
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tight">Audit Log</h1>
                <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.25em]">Neural Verification History</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="flex-row items-center gap-4 p-6 !bg-white/5 border-white/10 group hover:!bg-white/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Scans</p>
                        <p className="text-2xl font-black text-white">{totalScans}</p>
                    </div>
                </GlassCard>
                <GlassCard className="flex-row items-center gap-4 p-6 !bg-primary/5 border-primary/20 group hover:!bg-primary/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secure</p>
                        <p className="text-2xl font-black text-white">{safeCount}</p>
                    </div>
                </GlassCard>
                <GlassCard className="flex-row items-center gap-4 p-6 !bg-destructive/5 border-destructive/20 group hover:!bg-destructive/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Threats</p>
                        <p className="text-2xl font-black text-white">{riskyCount}</p>
                    </div>
                </GlassCard>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3 bg-white/5 p-4 rounded-[24px] border border-white/10">
                {/* Search */}
                <div className="relative group flex-1">
                    <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative h-10 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 gap-3 group-focus-within:border-primary/40 transition-all">
                        <Search size={16} className="text-zinc-600 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search UPI ID or merchant..."
                            className="bg-transparent border-none outline-none text-sm font-bold text-white w-full placeholder:text-zinc-700"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-zinc-600 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 hover:scale-105 active:scale-95 ${statusFilter === 'all'
                            ? 'bg-white/10 text-white border-white/20'
                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('safe')}
                        className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 hover:scale-105 active:scale-95 ${statusFilter === 'safe'
                            ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_rgba(124,255,178,0.2)]'
                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-primary'
                            }`}
                    >
                        Safe
                    </button>
                    <button
                        onClick={() => setStatusFilter('risky')}
                        className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 hover:scale-105 active:scale-95 ${statusFilter === 'risky'
                            ? 'bg-destructive/20 text-destructive border-destructive/40 shadow-[0_0_15px_rgba(255,107,107,0.2)]'
                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-destructive'
                            }`}
                    >
                        Risky
                    </button>
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 hover:scale-105 active:scale-95 flex items-center gap-2 ${showFavoritesOnly
                            ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_rgba(124,255,178,0.2)]'
                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-primary'
                            }`}
                    >
                        <Star size={14} className={showFavoritesOnly ? 'fill-primary' : ''} />
                        Favorites
                    </button>
                    <button
                        onClick={cycleSort}
                        className="h-10 px-4 rounded-xl bg-primary/10 border-2 border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <ArrowUpDown size={14} />
                        {sortMode}
                    </button>
                    <ExportMenu />
                </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Showing {filteredScans.length} of {totalScans} {totalScans === 1 ? 'scan' : 'scans'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setStatusFilter('all');
                        }}
                        className="text-xs font-bold text-zinc-500 hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                        <X size={12} />
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Scan List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredScans.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/[0.02] rounded-[32px] p-16 text-center border border-dashed border-white/5"
                        >
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-700">
                                {searchQuery || statusFilter !== 'all' ? <Search size={32} /> : <Clock size={32} />}
                            </div>
                            <p className="text-zinc-500 font-black uppercase text-xs tracking-[0.2em]">
                                {searchQuery || statusFilter !== 'all' ? 'No Matching Results' : 'Zero Activity Detected'}
                            </p>
                            <p className="text-zinc-700 text-[10px] mt-2 font-bold uppercase tracking-widest">
                                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Connect your first node to begin monitoring'}
                            </p>
                        </motion.div>
                    ) : (
                        filteredScans.map((scan, i) => (
                            <motion.div
                                key={scan.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: i * 0.03, type: "spring", damping: 20, stiffness: 100 }}
                            >
                                <GlassCard className="group p-0 overflow-hidden border-white/5 hover:border-white/10 transition-all !bg-white/[0.01] hover:!bg-white/[0.03]">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Status Indicator */}
                                        <div className={`w-full md:w-1.5 h-1.5 md:h-auto shrink-0 ${scan.status === 'safe' ? 'bg-primary/40' : 'bg-destructive/40'}`} />

                                        <div className="flex-1 p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 min-w-0">
                                            {/* Icon */}
                                            <div className={`h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all group-hover:scale-105 self-start ${scan.status === 'safe'
                                                ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(124,255,178,0.1)]'
                                                : 'bg-destructive/10 border-destructive/20 text-destructive shadow-[0_0_20px_rgba(255,107,107,0.1)]'
                                                }`}>
                                                {scan.status === 'safe' ? <CheckCircle2 size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} /> : <ShieldAlert size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-3 min-w-0">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="font-black text-white text-lg sm:text-xl tracking-tight group-hover:text-primary transition-colors break-all leading-tight">{scan.upiId}</h3>
                                                        <div className={`text-[9px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg uppercase tracking-wider border shrink-0 ${scan.status === 'safe'
                                                            ? 'bg-primary/20 border-primary/20 text-primary'
                                                            : 'bg-destructive/20 border-destructive/20 text-destructive'
                                                            }`}>
                                                            {scan.status === 'safe' ? 'SECURE' : 'THREAT'}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                            <CreditCard size={10} />
                                                            {scan.merchantName || "Unlabeled"}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-800 hidden sm:block" />
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {new Date(scan.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Protocol</p>
                                                        <p className="text-[9px] font-bold text-zinc-400">SHA-512</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Zone</p>
                                                        <p className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                                                            <MapPin size={8} />IN-MUM
                                                        </p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Hash</p>
                                                        <p className="text-[9px] font-bold text-zinc-400 font-mono">{scan.id.substring(0, 8)}</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Status</p>
                                                        <p className={`text-[9px] font-bold ${scan.status === 'safe' ? 'text-primary' : 'text-destructive'}`}>
                                                            {scan.status === 'safe' ? 'VERIFIED' : 'FLAGGED'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
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
