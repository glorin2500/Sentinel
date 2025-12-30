"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, AlertTriangle, TrendingUp, Lightbulb, DollarSign, Info } from "lucide-react";
import { SmartSuggestion, getSuggestionIcon } from "@/lib/smart-suggestions";

interface SmartSuggestionCardProps {
    suggestion: SmartSuggestion;
    onDismiss?: (id: string) => void;
    onAction?: () => void;
}

export function SmartSuggestionCard({ suggestion, onDismiss, onAction }: SmartSuggestionCardProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            onDismiss?.(suggestion.id);
        }, 300);
    };

    const getIcon = () => {
        switch (suggestion.type) {
            case 'add_to_favorites':
                return <Star size={20} className="text-primary" />;
            case 'security_warning':
            case 'amount_warning':
                return <AlertTriangle size={20} className="text-destructive" />;
            case 'performance_insight':
                return <TrendingUp size={20} className="text-primary" />;
            case 'behavior_tip':
                return <Lightbulb size={20} className="text-yellow-500" />;
            default:
                return <Info size={20} className="text-zinc-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (suggestion.type) {
            case 'add_to_favorites':
            case 'performance_insight':
                return 'bg-primary/5 border-primary/20';
            case 'security_warning':
            case 'amount_warning':
                return 'bg-destructive/5 border-destructive/20';
            case 'behavior_tip':
                return 'bg-yellow-500/5 border-yellow-500/20';
            default:
                return 'bg-white/5 border-white/10';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`relative p-4 rounded-2xl border ${getBackgroundColor()} backdrop-blur-sm`}
                >
                    {/* Dismiss button */}
                    {suggestion.dismissible && (
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <X size={14} className="text-zinc-400" />
                        </button>
                    )}

                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6">
                            <h4 className="text-sm font-black text-white mb-1">
                                {suggestion.title}
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {suggestion.message}
                            </p>

                            {/* Action button */}
                            {suggestion.action && (
                                <button
                                    onClick={() => {
                                        suggestion.action?.handler();
                                        onAction?.();
                                        if (suggestion.dismissible) {
                                            handleDismiss();
                                        }
                                    }}
                                    className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-white uppercase tracking-wider transition-all"
                                >
                                    {suggestion.action.label}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
