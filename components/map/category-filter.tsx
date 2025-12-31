"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ShoppingBag, Wrench, HeartPulse, Building2, MapPin, ChevronDown } from "lucide-react";
import { PlaceCategory } from "@/lib/map/overpass-service";
import { useState } from "react";

interface CategoryFilterProps {
    selected: PlaceCategory;
    onChange: (category: PlaceCategory) => void;
}

const CATEGORIES: { value: PlaceCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'all', label: 'All', icon: <MapPin size={16} />, color: '#8b5cf6' },
    { value: 'food', label: 'Food', icon: <Utensils size={16} />, color: '#f59e0b' },
    { value: 'shopping', label: 'Shop', icon: <ShoppingBag size={16} />, color: '#ec4899' },
    { value: 'services', label: 'Service', icon: <Wrench size={16} />, color: '#3b82f6' },
    { value: 'health', label: 'Health', icon: <HeartPulse size={16} />, color: '#10b981' },
    { value: 'finance', label: 'Bank', icon: <Building2 size={16} />, color: '#6366f1' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedCat = CATEGORIES.find(c => c.value === selected) || CATEGORIES[0];

    return (
        <div className="absolute top-20 right-4 z-[999]">
            {/* Mobile Dropdown */}
            <div className="md:hidden">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0A15]/90 backdrop-blur-xl border border-white/10 text-white shadow-xl"
                    whileTap={{ scale: 0.95 }}
                >
                    <span style={{ color: selectedCat.color }}>{selectedCat.icon}</span>
                    <span className="text-sm font-bold">{selectedCat.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-12 right-0 bg-[#0A0A15]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                        >
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => {
                                        onChange(cat.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${selected === cat.value ? 'bg-white/10' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <span style={{ color: cat.color }}>{cat.icon}</span>
                                    <span className="text-sm font-bold text-white">{cat.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Icon Grid */}
            <div className="hidden md:grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                    const isSelected = selected === cat.value;

                    return (
                        <motion.button
                            key={cat.value}
                            onClick={() => onChange(cat.value)}
                            className={`
                                p-2.5 rounded-lg backdrop-blur-xl border transition-all
                                ${isSelected
                                    ? 'bg-white/20 border-white/30 shadow-lg'
                                    : 'bg-[#0A0A15]/80 border-white/10 hover:bg-white/10'
                                }
                            `}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                boxShadow: isSelected ? `0 0 15px ${cat.color}40` : 'none'
                            }}
                            title={cat.label}
                        >
                            <span style={{ color: isSelected ? cat.color : '#a1a1aa' }}>
                                {cat.icon}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
