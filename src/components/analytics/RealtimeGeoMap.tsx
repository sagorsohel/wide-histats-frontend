"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Plus, Minus, RotateCcw, Maximize2, Minimize2, MapPin } from "lucide-react";

// Point MapLibre directly to static public worker to eliminate 404 HTML mime type error
if (typeof window !== "undefined") {
  try {
    if ((maplibregl as any)?.config) {
      (maplibregl as any).config.WORKER_URL = "/maplibre-gl-worker.mjs";
    }
  } catch {}
}

// Point MapLibre directly to static public worker to eliminate 404 HTML mime type error
if (typeof window !== "undefined") {
  try {
    if ((maplibregl as any)?.config) {
      (maplibregl as any).config.WORKER_URL = "/maplibre-gl-worker.mjs";
    }
  } catch {}
}

// Known coordinates [longitude, latitude] for major countries
const COUNTRY_COORDS: Record<string, [number, number]> = {
  BD: [90.3563, 23.685],
  US: [-95.7129, 37.0902],
  GB: [-3.436, 55.3781],
  UK: [-3.436, 55.3781],
  IN: [78.9629, 20.5937],
  CA: [-106.3468, 56.1304],
  DE: [10.4515, 51.1657],
  FR: [2.2137, 46.2276],
  IT: [12.5674, 41.8719],
  ES: [-3.7492, 40.4637],
  AU: [133.7751, -25.2744],
  JP: [138.2529, 36.2048],
  CN: [104.1954, 35.8617],
  BR: [-51.9253, -14.235],
  NL: [5.2913, 52.1326],
  RU: [105.3188, 61.524],
  TR: [35.2433, 38.9637],
  ID: [113.9213, -0.7893],
  PK: [69.3451, 30.3753],
  VN: [108.2772, 14.0583],
  PH: [121.774, 12.8797],
  EG: [30.8025, 26.8206],
  ZA: [22.9375, -30.5595],
  NG: [8.6753, 9.082],
  KE: [37.9062, -0.0236],
  MX: [-102.5528, 23.6345],
  AR: [-63.6167, -38.4161],
  CL: [-71.543, -35.6751],
  CO: [-74.2973, 4.5709],
  SE: [18.6435, 60.1282],
  NO: [8.4689, 60.472],
  FI: [25.7482, 61.9241],
  DK: [9.5018, 56.2639],
  PL: [19.1451, 51.9194],
  UA: [31.1656, 48.3794],
  GR: [21.8243, 39.0742],
  PT: [-8.2245, 39.3999],
  AT: [14.5501, 47.5162],
  CH: [8.2275, 46.8182],
  BE: [4.4699, 50.5039],
  IE: [-8.2439, 53.4129],
  NZ: [174.886, -40.9006],
  KR: [127.7669, 35.9078],
  SA: [45.0792, 23.8859],
  AE: [53.8478, 23.4241],
  SG: [103.8198, 1.3521],
  MY: [101.9758, 4.2105],
  TH: [100.9925, 15.87],
  HK: [114.1694, 22.3193],
  TW: [120.9605, 23.6978],
};

// 100% Free Open-Source Map Styles (Zero API Key Required)
const MAP_STYLES: Record<string, any> = {
  dark: {
    version: 8,
    sources: {
      "carto-dark": {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      },
    },
    layers: [
      {
        id: "carto-dark-layer",
        type: "raster",
        source: "carto-dark",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  voyager: {
    version: 8,
    sources: {
      "carto-voyager": {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
          "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
          "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      },
    },
    layers: [
      {
        id: "carto-voyager-layer",
        type: "raster",
        source: "carto-voyager",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  osm: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osm",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

export interface MapCountryData {
  country: string;
  code: string;
  count: number;
  city?: string;
}

interface RealtimeGeoMapProps {
  countryData?: MapCountryData[];
  height?: string;
  className?: string;
}

export const RealtimeGeoMap: React.FC<RealtimeGeoMapProps> = ({
  countryData = [],
  height = "240px",
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [styleMode, setStyleMode] = useState<"dark" | "voyager" | "osm">("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalCount = countryData.reduce((acc, c) => acc + (c.count || 0), 0);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLES[styleMode],
        center: [15, 25],
        zoom: 1.15,
        minZoom: 0.8,
        maxZoom: 14,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
        }),
        "bottom-right"
      );

      mapRef.current = map;

      const handleResize = () => {
        map.resize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    } catch (e) {
      console.error("MapLibre GL init error:", e);
    }
  }, []);

  // Update map style on mode toggle
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      mapRef.current.setStyle(MAP_STYLES[styleMode]);
    } catch (err) {
      console.warn("Could not set style:", err);
    }
  }, [styleMode]);

  // Fallback coordinate generator for unknown countries
  const getCoordinates = useCallback((code: string): [number, number] => {
    const upper = (code || "").toUpperCase().trim();
    if (COUNTRY_COORDS[upper]) {
      return COUNTRY_COORDS[upper];
    }
    // Deterministic fallback based on code letters
    let hash = 0;
    for (let i = 0; i < upper.length; i++) {
      hash = (hash << 5) - hash + upper.charCodeAt(i);
      hash |= 0;
    }
    const lon = ((Math.abs(hash * 37) % 320) - 160);
    const lat = ((Math.abs(hash * 73) % 110) - 45);
    return [lon, lat];
  }, []);

  // Sync Markers when countryData changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!countryData || countryData.length === 0) return;

    countryData.forEach((item) => {
      const coords = getCoordinates(item.code);
      const count = item.count || 0;

      // Color scheme based on traffic
      const isHigh = count >= 20;
      const isMedium = count >= 5;
      const pulseColor = isHigh
        ? "bg-rose-500"
        : isMedium
        ? "bg-amber-400"
        : "bg-emerald-400";
      const badgeBg = isHigh
        ? "bg-rose-600 text-white border-rose-300"
        : isMedium
        ? "bg-amber-500 text-slate-950 border-amber-300"
        : "bg-emerald-600 text-white border-emerald-300";

      // Create Custom DOM Marker
      const el = document.createElement("div");
      el.className = "group relative cursor-pointer select-none";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-7 w-7 rounded-full opacity-75 animate-ping ${pulseColor}"></span>
          <span class="relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-md border ${badgeBg} transition-transform transform group-hover:scale-125">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            ${count}
          </span>
        </div>
      `;

      // Popup
      const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0.0";
      const popupHtml = `
        <div style="font-family: inherit; font-size: 11px; padding: 2px 4px; min-width: 140px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
            <strong style="font-weight: 700; color: #1e293b;">${item.country}</strong>
            <span style="font-family: monospace; font-size: 10px; background: #e2e8f0; padding: 1px 4px; border-radius: 4px; font-weight: 600;">${item.code || ""}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #64748b;">Active Users:</span>
            <strong style="font-weight: 700; color: #2563eb;">${count}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Share:</span>
            <span style="font-weight: 600; color: #059669;">${percentage}%</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: false,
        className: "custom-maplibre-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      // Show popup on hover
      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());

      markersRef.current.push(marker);
    });
  }, [countryData, getCoordinates, totalCount]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleReset = () => {
    mapRef.current?.flyTo({
      center: [15, 25],
      zoom: 1.15,
      pitch: 0,
      bearing: 0,
      duration: 600,
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapRef.current?.resize();
    }, 150);
  };

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none bg-slate-950 p-2"
          : "rounded-xl border border-slate-700/30 bg-[#0d1726]"
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Header Info */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-[11px] text-slate-200 font-medium">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Telemetry Map</span>
          <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
            {countryData.length} {countryData.length === 1 ? "region" : "regions"}
          </span>
        </div>
      </div>

      {/* Control Buttons Group (Top Right) */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
        {/* Style mode switcher */}
        <div className="flex items-center bg-slate-950/80 backdrop-blur-md rounded-lg p-0.5 border border-slate-700/60 shadow-lg">
          <button
            type="button"
            onClick={() => setStyleMode("dark")}
            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
              styleMode === "dark"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Dark Theme"
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setStyleMode("voyager")}
            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
              styleMode === "voyager"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Street / Voyager Theme"
          >
            Street
          </button>
          <button
            type="button"
            onClick={() => setStyleMode("osm")}
            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
              styleMode === "osm"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="OpenStreetMap Standard"
          >
            OSM
          </button>
        </div>

        {/* Zoom & Reset Buttons */}
        <div className="flex items-center bg-slate-950/80 backdrop-blur-md rounded-lg p-0.5 border border-slate-700/60 shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors border-l border-slate-700/60 ml-0.5 pl-1.5"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Legend */}
      <div className="absolute bottom-2 left-2.5 flex items-center gap-3 pointer-events-none z-10 text-[10px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-rose-500/50 shadow-xs"></span>
          <span>&gt;20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-amber-400/50 shadow-xs"></span>
          <span>5-20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-400/50 shadow-xs"></span>
          <span>1-5</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-semibold">{totalCount} active</span>
      </div>
    </div>
  );
};
