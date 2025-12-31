"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { getNearbyMerchants, Merchant } from "@/lib/map/merchant-service";
import { MapPin, Navigation, Shield, AlertTriangle, Star, Search, Filter, X, Locate } from "lucide-react";
import { hapticClick, hapticLight } from "@/lib/haptic";

export function MerchantMap() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [filter, setFilter] = useState<'all' | 'safe' | 'risky'>('all');
    const containerRef = useRef<HTMLDivElement>(null);

    // Mock map state
    const [scale, setScale] = useState(1);

    // Fetch data on mount
    useEffect(() => {
        setMerchants(getNearbyMerchants());
    }, []);

    const filteredMerchants = merchants.filter(m => {
        if (filter === 'all') return true;
        return m.status === filter;
    });

    const handleMerchantClick = (merchant: Merchant) => {
        hapticClick();
        setSelectedMerchant(merchant);
    };

    const handleCloseDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        hapticLight();
        setSelectedMerchant(null);
    };

    return (
        <div className="relative w-full h-full bg-[#050510] overflow-hidden rounded-3xl border border-white/10 group">
            {/* Map Grid Background (Cyber Style) */}
            <motion.div
                ref={containerRef}
                drag
                dragConstraints={{ left: -500, right: 0, top: -500, bottom: 0 }}
                dragElastic={0.1}
                className="absolute inset-0 w-[200%] h-[200%] cursor-grab active:cursor-grabbing bg-[#0A0A15]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                    scale
                }}
            >
                {/* Street Lines Mock */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                    <path d="M0 400 H 2000 M 400 0 V 2000 M 0 800 H 2000 M 800 0 V 2000" stroke="white" strokeWidth="2" />
                    <path d="M0 200 H 2000 M 200 0 V 2000 M 600 0 V 2000 M 0 600 H 2000" stroke="white" strokeWidth="0.5" />
                    <circle cx="900" cy="500" r="100" stroke="white" strokeWidth="1" fill="none" />
                </svg>

                {/* User Location Pulse */}
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 z-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping w-24 h-24" />
                        <div className="relative z-10 w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>

                {/* Merchant Markers */}
                {filteredMerchants.map((merchant) => (
                    <motion.div
                        key={merchant.id}
                        className="absolute z-10"
                        style={{
                            // Randomize position slightly for mock feel based on ID hash or simplified logic
                            left: `${(merchant.longitude - 77.59) * 10000 + 25}%`,
                            top: `${(merchant.latitude - 12.97) * -10000 + 25}%`
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.2, zIndex: 50 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMerchantClick(merchant);
                        }}
                    >
                        <div className={`relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer transition-colors duration-300`}>
                            {/* Marker Icon */}
                            <div className={`p-2 rounded-full border-2 shadow-lg backdrop-blur-md ${merchant.status === 'safe'
                                ? 'bg-green-500/10 border-green-500 text-green-500 shadow-green-500/20'
                                : merchant.status === 'risky'
                                    ? 'bg-red-500/10 border-destructive text-destructive shadow-red-500/20'
                                    : 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-yellow-500/20'
                                }`}>
                                {merchant.status === 'safe' ? (
                                    <Shield size={20} fill={merchant.isSentinelApproved ? "currentColor" : "none"} />
                                ) : merchant.status === 'risky' ? (
                                    <AlertTriangle size={20} />
                                ) : (
                                    <HelpCircle size={20} />
                                )}
                            </div>

                            {/* Label */}
                            <span className="mt-1 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                {merchant.name}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* UI Overlay: Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex gap-3 z-20">
                <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-lg">
                    <Search className="text-zinc-500 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search nearby merchants..."
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-zinc-500 font-medium"
                    />
                </div>
                <button
                    onClick={() => setFilter(f => f === 'all' ? 'safe' : f === 'safe' ? 'risky' : 'all')}
                    className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors shadow-lg active:scale-95"
                >
                    <Filter size={20} className={filter === 'all' ? 'text-white' : filter === 'safe' ? 'text-green-500' : 'text-destructive'} />
                </button>
            </div>

            {/* UI Overlay: Map Controls */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-3 z-20">
                <button className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-colors shadow-lg active:scale-95">
                    <Locate size={20} className="text-blue-500" />
                </button>
            </div>

            {/* Merchant Details Panel */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: selectedMerchant ? "0%" : "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute left-0 right-0 bottom-0 z-30 bg-[#0A0A15]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.05}
                onDragEnd={(e, { offset, velocity }) => {
                    if (offset.y > 100 || velocity.y > 500) {
                        setSelectedMerchant(null);
                    }
                }}
            >
                {/* Drag Handle */}
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />

                {selectedMerchant && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-black text-white">{selectedMerchant.name}</h2>
                                    {selectedMerchant.isSentinelApproved && (
                                        <div className="bg-green-500/20 p-1 rounded-full">
                                            <Shield size={12} className="text-green-500 fill-green-500" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-400 font-medium">{selectedMerchant.category} • {selectedMerchant.address}</p>
                            </div>
                            <button
                                onClick={handleCloseDetails}
                                className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Status Card */}
                        <div className={`p-4 rounded-xl border ${selectedMerchant.status === 'safe'
                            ? 'bg-green-500/5 border-green-500/20'
                            : selectedMerchant.status === 'risky'
                                ? 'bg-red-500/5 border-destructive/20'
                                : 'bg-yellow-500/5 border-yellow-500/20'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {selectedMerchant.status === 'safe' ? (
                                        <Shield className="text-green-500" size={18} />
                                    ) : <AlertTriangle className="text-destructive" size={18} />}
                                    <span className={`text-sm font-black uppercase ${selectedMerchant.status === 'safe' ? 'text-green-500' : 'text-destructive'
                                        }`}>
                                        {selectedMerchant.status === 'safe' ? 'Sentinel Verified' : 'Risk Detected'}
                                    </span>
                                </div>
                                <span className="text-2xl font-black text-white">{selectedMerchant.safetyScore}%</span>
                            </div>

                            {selectedMerchant.threatType && (
                                <div className="flex gap-2 mt-2">
                                    {selectedMerchant.threatType.map(tag => (
                                        <span key={tag} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold uppercase">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Community Rating</span>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-lg font-bold text-white">{selectedMerchant.rating}</span>
                                    <span className="text-xs text-zinc-500">({selectedMerchant.reviews})</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Scans</span>
                                <div className="flex items-center gap-1 mt-1">
                                    <Scan size={16} className="text-blue-500" />
                                    <span className="text-lg font-bold text-white">1,204</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-primary text-black font-black uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <Navigation size={18} />
                                Navigate
                            </button>
                            <button className="flex-1 py-3 bg-white/10 text-white font-bold uppercase rounded-xl hover:bg-white/20 active:scale-[0.98] transition-all border border-white/10">
                                View History
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function Scan({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>
    )
}
