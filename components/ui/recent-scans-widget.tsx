"use client";

import { useSentinelStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle, Clock } from "lucide-react";

export function RecentScansWidget() {
    const { scans } = useSentinelStore();
    const router = useRouter();

    // Get the 3 most recent scans
    const recentScans = scans.slice(0, 3);

    const getTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="p-4 sm:p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                    Recent Scans
                </h3>
                <button
                    onClick={() => router.push('/history')}
                    className="text-[9px] sm:text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                    View All
                </button>
            </div>

            {recentScans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Shield size={28} className="text-zinc-600" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400 mb-1">No scans yet</p>
                    <p className="text-xs text-zinc-600">
                        Start by scanning your first UPI QR code
                    </p>
                    <button
                        onClick={() => router.push('/scan')}
                        className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all"
                    >
                        Scan Now
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {recentScans.map((scan) => (
                        <div
                            key={scan.id}
                            onClick={() => router.push('/history')}
                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <div
                                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border group-hover:scale-110 transition-transform ${scan.status === "safe"
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                            >
                                {scan.status === "safe" ? (
                                    <Shield size={18} className="sm:w-5 sm:h-5" />
                                ) : (
                                    <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p
                                        className={`text-xs sm:text-sm font-bold truncate transition-colors ${scan.status === "safe"
                                                ? "text-white group-hover:text-primary"
                                                : "text-white group-hover:text-red-400"
                                            }`}
                                    >
                                        {scan.merchantName || scan.upiId}
                                    </p>
                                    <span className="text-[10px] sm:text-xs text-zinc-500 flex-shrink-0 flex items-center gap-1">
                                        <Clock size={10} className="sm:w-3 sm:h-3" />
                                        {getTimeAgo(scan.timestamp)}
                                    </span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">
                                    {scan.status === "safe"
                                        ? `Verified • ${scan.upiId}`
                                        : `${scan.threatType || "Risk Detected"} • ${scan.upiId}`
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
