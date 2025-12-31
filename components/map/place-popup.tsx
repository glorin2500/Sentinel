"use client";

import { Shield, AlertTriangle, HelpCircle, Navigation2, Phone, Clock } from "lucide-react";
import { EnhancedPlace } from "@/lib/map/place-intelligence";

interface PlacePopupProps {
    place: EnhancedPlace;
}

export function PlacePopup({ place }: PlacePopupProps) {
    const getRiskBadge = () => {
        const badges = {
            safe: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-500', label: 'Safe', icon: Shield },
            caution: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-500', label: 'Caution', icon: HelpCircle },
            warning: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-500', label: 'Warning', icon: AlertTriangle },
            danger: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-500', label: 'Danger', icon: AlertTriangle }
        };
        return badges[place.riskLevel];
    };

    const badge = getRiskBadge();
    const Icon = badge.icon;

    return (
        <div className="p-3 font-sans min-w-[240px] max-w-[280px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white leading-tight truncate">{place.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mt-0.5">{place.category}</p>
                </div>
                {place.isSentinelVerified && (
                    <div className="flex-shrink-0 bg-green-500/20 p-1 rounded-md border border-green-500/30">
                        <Shield size={12} className="text-green-500 fill-green-500" />
                    </div>
                )}
            </div>

            {/* Safety Badge - Compact */}
            <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${badge.bg} ${badge.border} mb-2`}>
                <div className="flex items-center gap-1.5">
                    <Icon size={14} className={badge.text} />
                    <span className={`text-xs font-bold ${badge.text}`}>{badge.label}</span>
                </div>
                <span className="text-sm font-black text-white">{place.safetyScore}%</span>
            </div>

            {/* Quick Info - Only if available */}
            {(place.phone || place.opening_hours) && (
                <div className="space-y-1 mb-2">
                    {place.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Phone size={12} />
                            <span className="truncate">{place.phone}</span>
                        </div>
                    )}
                    {place.opening_hours && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Clock size={12} />
                            <span className="truncate">{place.opening_hours}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Action Button - Single, Clear CTA */}
            <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`, '_blank')}
                className="w-full py-2 bg-primary text-black font-bold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
                <Navigation2 size={14} />
                Navigate
            </button>
        </div>
    );
}
