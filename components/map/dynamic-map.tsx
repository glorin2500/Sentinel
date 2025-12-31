"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(
    () => import("@/components/map/sentinel-leaflet-map"),
    {
        loading: () => <div className="w-full h-full bg-[#050510] animate-pulse flex items-center justify-center text-zinc-500 text-sm">Initializing Satellite Link...</div>,
        ssr: false
    }
);

export default Map;
