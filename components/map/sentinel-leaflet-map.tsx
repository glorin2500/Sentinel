"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getNearbyMerchants, Merchant } from "@/lib/map/merchant-service";
import { Shield, AlertTriangle, HelpCircle, Navigation, Star, Scan } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Custom Hook to update map view
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function SentinelLeafletMap() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [userLocation] = useState<[number, number]>([12.9716, 77.5946]); // Bangalore Mock

    useEffect(() => {
        // Fix Leaflet's default icon path issues in Next.js
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        setMerchants(getNearbyMerchants(userLocation[0], userLocation[1]));
    }, [userLocation]);

    // Create custom icons using DivIcon and Lucide React rendered to HTML
    const createCustomIcon = (type: 'safe' | 'risky' | 'unknown' | 'user') => {
        let iconHtml = '';
        let className = '';

        if (type === 'user') {
            return L.divIcon({
                className: 'custom-icon-user',
                html: `
                    <div class="relative w-6 h-6">
                        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                        <div class="relative w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
        }

        const color = type === 'safe' ? '#22c55e' : type === 'risky' ? '#ef4444' : '#eab308';
        const bg = type === 'safe' ? 'rgba(34,197,94,0.2)' : type === 'risky' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)';

        let SvgIcon = Shield;
        if (type === 'risky') SvgIcon = AlertTriangle;
        if (type === 'unknown') SvgIcon = HelpCircle;

        const svgString = renderToStaticMarkup(<SvgIcon size={20} color={color} strokeWidth={2.5} />);

        return L.divIcon({
            className: `custom-marker-${type}`,
            html: `
                <div class="flex flex-col items-center justify-center -translate-y-full group">
                    <div class="p-2 rounded-full border-2 backdrop-blur-sm shadow-lg transition-transform hover:scale-110" style="background-color: ${bg}; border-color: ${color}; box-shadow: 0 0 15px ${bg};">
                        ${svgString}
                    </div>
                    <div class="w-1 h-3 bg-white/20"></div>
                    <div class="w-2 h-1 bg-white/50 rounded-full blur-[1px]"></div>
                </div>
            `,
            iconSize: [40, 60],
            iconAnchor: [20, 60],
            popupAnchor: [0, -60]
        });
    };

    return (
        <div className="w-full h-full relative z-0">
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background: rgba(10, 10, 21, 0.95) !important;
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    color: white;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    padding: 0;
                }
                .leaflet-popup-tip {
                    background: rgba(10, 10, 21, 0.95) !important;
                }
                .leaflet-container {
                    background: #050510;
                    font-family: var(--font-urbanist);
                }
            `}</style>

            <MapContainer
                center={userLocation}
                zoom={16}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={userLocation} />

                {/* User Location */}
                <Marker position={userLocation} icon={createCustomIcon('user')} />

                {/* Merchants */}
                {merchants.map(merchant => (
                    <Marker
                        key={merchant.id}
                        position={[merchant.latitude, merchant.longitude]}
                        icon={createCustomIcon(merchant.status)}
                    >
                        <Popup closeButton={false} maxWidth={300} minWidth={280}>
                            <div className="p-4 font-sans">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-black text-white m-0 leading-tight">{merchant.name}</h3>
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">{merchant.category}</p>
                                    </div>
                                    {merchant.isSentinelApproved && (
                                        <div className="bg-green-500/20 p-1 rounded-full border border-green-500/30">
                                            <Shield size={14} className="text-green-500 fill-green-500" />
                                        </div>
                                    )}
                                </div>

                                <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${merchant.status === 'safe' ? 'bg-green-500/10 border-green-500/20' :
                                        merchant.status === 'risky' ? 'bg-red-500/10 border-red-500/20' :
                                            'bg-yellow-500/10 border-yellow-500/20'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {merchant.status === 'safe' && <Shield size={16} className="text-green-500" />}
                                        {merchant.status === 'risky' && <AlertTriangle size={16} className="text-red-500" />}
                                        {merchant.status === 'unknown' && <HelpCircle size={16} className="text-yellow-500" />}
                                        <span className={`text-xs font-black uppercase ${merchant.status === 'safe' ? 'text-green-500' :
                                                merchant.status === 'risky' ? 'text-red-500' : 'text-yellow-500'
                                            }`}>
                                            {merchant.status === 'safe' ? 'Verified Safe' : merchant.status === 'risky' ? 'Risk Detected' : 'Unknown'}
                                        </span>
                                    </div>
                                    <span className="text-lg font-black text-white">{merchant.safetyScore}%</span>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-primary text-black font-black uppercase text-xs rounded-lg hover:opacity-90 transition-opacity">
                                        Navigate
                                    </button>
                                    <button className="flex-1 py-2 bg-white/10 text-white font-bold uppercase text-xs rounded-lg hover:bg-white/20 transition-colors border border-white/10">
                                        History
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
