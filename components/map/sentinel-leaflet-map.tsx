"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import { Shield, AlertTriangle, HelpCircle, Navigation, Search, Loader2, MapPin } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { EnhancedPlace, fetchEnhancedNearbyPlaces, getRiskColor, getPlaceMarkerStyle } from "@/lib/map/place-intelligence";
import { PlaceCategory } from "@/lib/map/overpass-service";
import { CategoryFilter } from "./category-filter";
import { PlacePopup } from "./place-popup";

// Custom Hook to update map view
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function SentinelLeafletMap() {
    const [places, setPlaces] = useState<EnhancedPlace[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number]>([9.9312, 76.2673]); // Default: Kochi, Kerala
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([9.9312, 76.2673]); // Kochi, Kerala
    const [isClient, setIsClient] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('all');

    // Initialize client-side only
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get Real User Location on Mount
    useEffect(() => {
        if (typeof window !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const realLoc: [number, number] = [latitude, longitude];
                    setUserLocation(realLoc);
                    setMapCenter(realLoc);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    // Fetch Real Places whenever Map Center or Category changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Fix Leaflet's default icon path issues
            const L = require("leaflet");
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        }

        // Fetch real places from Overpass API
        const loadPlaces = async () => {
            setIsLoadingPlaces(true);
            try {
                const enhancedPlaces = await fetchEnhancedNearbyPlaces(
                    mapCenter[0],
                    mapCenter[1],
                    5000, // 5km radius for better Kerala coverage
                    selectedCategory
                );
                setPlaces(enhancedPlaces);
            } catch (error) {
                console.error('Error loading places:', error);
            } finally {
                setIsLoadingPlaces(false);
            }
        };

        loadPlaces();
    }, [mapCenter, selectedCategory]);

    // Nominatim Search Handler
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapCenter(newCenter);
                // MapUpdater will handle flyTo via passing center prop
                // Note: We need to ensure MapUpdater uses mapCenter, not userLocation
            } else {
                alert("Location not found");
            }
        } catch (error) {
            console.error("Search failed:", error);
            alert("Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocateMe = () => {
        if (typeof window !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                const loc: [number, number] = [latitude, longitude];
                setUserLocation(loc);
                setMapCenter(loc);
            });
        }
    };

    // Create custom icons for places
    const createPlaceIcon = (place: EnhancedPlace) => {
        if (typeof window === "undefined") return undefined;

        const L = require("leaflet");
        const style = getPlaceMarkerStyle(place);

        let IconComponent = MapPin;
        if (place.riskLevel === 'safe' && place.isSentinelVerified) IconComponent = Shield;
        if (place.riskLevel === 'danger' || place.riskLevel === 'warning') IconComponent = AlertTriangle;
        if (place.reportCount === 0 && !place.isSentinelVerified) IconComponent = HelpCircle;

        const svgString = renderToStaticMarkup(
            <IconComponent size={20} color={style.color} strokeWidth={2.5} />
        );

        const pulseAnimation = style.pulse ? 'animate-ping' : '';

        return L.divIcon({
            className: `custom-place-marker`,
            html: `
                <div class="flex flex-col items-center justify-center -translate-y-full group">
                    ${style.pulse ? `<div class="absolute inset-0 ${pulseAnimation} opacity-75" style="background-color: ${style.color}20; border-radius: 50%;"></div>` : ''}
                    <div class="relative p-2 rounded-full border-2 backdrop-blur-sm shadow-lg transition-transform hover:scale-110" 
                         style="background-color: ${style.backgroundColor}; border-color: ${style.borderColor}; box-shadow: ${style.glow};">
                        ${svgString}
                        ${place.isSentinelVerified ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>' : ''}
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

    // Create custom icons using DivIcon and Lucide React rendered to HTML
    const createCustomIcon = (type: 'user') => {
        if (typeof window === "undefined") return undefined;

        const L = require("leaflet");
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

        return undefined;
    };

    // Don't render until client-side
    if (!isClient) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#050510]">
                <div className="text-zinc-500 text-sm">Initializing map...</div>
            </div>
        );
    }

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

            {/* Search Bar Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 pointer-events-auto">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a location..."
                        className="w-full h-12 bg-[#0A0A15]/90 backdrop-blur-xl border border-white/10 rounded-2xl pl-10 pr-4 text-white placeholder:text-zinc-500 shadow-xl outline-none focus:border-primary/50 transition-colors"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-primary" />
                        </div>
                    )}
                </form>
                <div onClick={handleLocateMe} className="h-12 w-12 bg-[#0A0A15]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-xl cursor-pointer hover:bg-white/10 active:scale-95 transition-all">
                    <Navigation size={20} className="fill-blue-500/20" />
                </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

            {/* Loading Indicator */}
            {isLoadingPlaces && (
                <div className="absolute top-36 left-1/2 -translate-x-1/2 z-[999] bg-[#0A0A15]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-sm text-zinc-300">Loading places...</span>
                </div>
            )}

            <MapContainer
                center={userLocation}
                zoom={15}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={mapCenter} />

                {/* User Location */}
                <Marker position={userLocation} icon={createCustomIcon('user')}>
                    <Popup closeButton={false}>
                        <div className="p-2 text-center text-xs font-bold text-zinc-300">
                            Your Current Location
                        </div>
                    </Popup>
                </Marker>

                {/* Real Places with Safety Data - Clustered */}
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                    iconCreateFunction={(cluster: any) => {
                        const count = cluster.getChildCount();
                        let size: 'small' | 'medium' | 'large' = 'small';
                        if (count > 10) size = 'medium';
                        if (count > 25) size = 'large';

                        const sizeMap: Record<'small' | 'medium' | 'large', string> = {
                            small: 'w-8 h-8 text-xs',
                            medium: 'w-10 h-10 text-sm',
                            large: 'w-12 h-12 text-base'
                        };

                        if (typeof window !== "undefined") {
                            const L = require("leaflet");
                            return L.divIcon({
                                html: `
                                    <div class="${sizeMap[size]} bg-primary/90 backdrop-blur-sm rounded-full border-2 border-white/20 flex items-center justify-center font-black text-black shadow-lg">
                                        ${count}
                                    </div>
                                `,
                                className: 'custom-cluster-icon',
                                iconSize: [40, 40]
                            });
                        }
                        return undefined as any;
                    }}
                >
                    {places.map(place => (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lon]}
                            icon={createPlaceIcon(place)}
                        >
                            <Popup closeButton={false} maxWidth={300} minWidth={260}>
                                <PlacePopup place={place} />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
