"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { ScanResult } from "@/lib/store";
import { formatShareText, shareContent } from "@/lib/export-utils";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
    scan: ScanResult;
    variant?: "default" | "icon";
    className?: string;
}

export function ShareButton({ scan, variant = "default", className = "" }: ShareButtonProps) {
    const [isSharing, setIsSharing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        const text = formatShareText(scan);
        const success = await shareContent(text, "Sentinel Scan Result");

        setIsSharing(false);
        if (success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleShare}
                disabled={isSharing}
                className={`h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/20 transition-all disabled:opacity-50 ${className}`}
                title="Share scan result"
            >
                <AnimatePresence mode="wait">
                    {showSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Check size={18} className="text-primary" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="share"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Share2 size={18} className="text-zinc-400" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            disabled={isSharing}
            className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 hover:border-primary/20 transition-all disabled:opacity-50 ${className}`}
        >
            <AnimatePresence mode="wait">
                {showSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Check size={16} className="text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-wider">
                            {navigator.share ? "Shared!" : "Copied!"}
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="share"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        {navigator.share ? <Share2 size={16} /> : <Copy size={16} />}
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                            {isSharing ? "Sharing..." : navigator.share ? "Share" : "Copy"}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
