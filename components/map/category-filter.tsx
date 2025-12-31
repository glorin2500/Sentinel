"use client";

import { motion } from "framer-motion";
import { Utensils, ShoppingBag, Wrench, HeartPulse, Building2, MapPin } from "lucide-react";
import { PlaceCategory } from "@/lib/map/overpass-service";

interface CategoryFilterProps {
    selected: PlaceCategory;
    onChange: (category: PlaceCategory) => void;
}

const CATEGORIES: { value: PlaceCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'all', label: 'All', icon: <MapPin size={18} />, color: '#8b5cf6' },
    { value: 'food', label: 'Food', icon: <Utensils size={18} />, color: '#f59e0b' },
    { value: 'shopping', label: 'Shopping', icon: <ShoppingBag size={18} />, color: '#ec4899' },
    { value: 'services', label: 'Services', icon: <Wrench size={18} />, color: '#3b82f6' },
    { value: 'health', label: 'Health', icon: <HeartPulse size={18} />, color: '#10b981' },
    { value: 'finance', label: 'Finance', icon: <Building2 size={18} />, color: '#6366f1' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
    return (
        <div className="absolute top-20 left-4 right-4 z-[999] flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => {
                const isSelected = selected === cat.value;

                return (
                    <motion.button
                        key={cat.value}
                        onClick={() => onChange(cat.value)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-full
                            backdrop-blur-xl border transition-all whitespace-nowrap
                            ${isSelected
                                ? 'bg-white/20 border-white/30 text-white shadow-lg'
                                : 'bg-[#0A0A15]/80 border-white/10 text-zinc-400 hover:bg-white/10'
                            }
                        `}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            boxShadow: isSelected ? `0 0 20px ${cat.color}40` : 'none'
                        }}
                    >
                        <span style={{ color: isSelected ? cat.color : undefined }}>
                            {cat.icon}
                        </span>
                        <span className="text-sm font-bold">{cat.label}</span>
                        {isSelected && (
                            <motion.div
                                layoutId="category-indicator"
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
