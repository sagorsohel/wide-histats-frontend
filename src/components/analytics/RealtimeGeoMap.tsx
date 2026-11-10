"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Minimize2,
  MapPin,
} from "lucide-react";

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

// Known coordinates [longitude, latitude] for major world cities
const CITY_COORDS: Record<string, [number, number]> = {
  bangkok: [100.5018, 13.7563],
  hanoi: [105.8342, 21.0278],
  "ho chi minh city": [106.6297, 10.8231],
  "chiang mai": [98.9853, 18.7883],
  "nakhon ratchasima": [102.0978, 14.9799],
  "khon kaen": [102.8236, 16.4322],
  "nha trang": [109.1967, 12.2388],
  kemerovo: [86.0872, 55.3547],
  hyderabad: [78.4867, 17.385],
  vellore: [79.1325, 12.9165],
  mumbai: [72.8777, 19.076],
  delhi: [77.1025, 28.7041],
  bangalore: [77.5946, 12.9716],
  bengaluru: [77.5946, 12.9716],
  chennai: [80.2707, 13.0827],
  kolkata: [88.3639, 22.5726],
  dhaka: [90.4125, 23.8103],
  chittagong: [91.8365, 22.3569],
  chattogram: [91.8365, 22.3569],
  sylhet: [91.8687, 24.8949],
  rajshahi: [88.6042, 24.3636],
  khulna: [89.5403, 22.8456],
  "new york": [-74.006, 40.7128],
  "los angeles": [-118.2437, 34.0522],
  chicago: [-87.6298, 41.8781],
  houston: [-95.3698, 29.7604],
  phoenix: [-112.074, 33.4484],
  philadelphia: [-75.1652, 39.9526],
  "san antonio": [-98.4936, 29.4241],
  "san diego": [-117.1611, 32.7157],
  dallas: [-96.797, 32.7767],
  "san jose": [-121.8863, 37.3382],
  austin: [-97.7431, 30.2672],
  "san francisco": [-122.4194, 37.7749],
  seattle: [-122.3321, 47.6062],
  miami: [-80.1918, 25.7617],
  boston: [-71.0589, 42.3601],
  london: [-0.1278, 51.5074],
  manchester: [-2.2426, 53.4808],
  birmingham: [-1.8904, 52.4862],
  paris: [2.3522, 48.8566],
  marseille: [5.3698, 43.2965],
  lyon: [4.8357, 45.764],
  berlin: [13.405, 52.52],
  munich: [11.582, 48.1351],
  frankfurt: [8.6821, 50.1109],
  hamburg: [9.9937, 53.5511],
  rome: [12.4964, 41.9028],
  milan: [9.19, 45.4642],
  madrid: [-3.7038, 40.4168],
  barcelona: [2.1734, 41.3851],
  amsterdam: [4.9041, 52.3676],
  rotterdam: [4.4777, 51.9244],
  brussels: [4.3517, 50.8503],
  vienna: [16.3738, 48.2082],
  zurich: [8.5417, 47.3769],
  geneva: [6.1432, 46.2044],
  stockholm: [18.0686, 59.3293],
  oslo: [10.7522, 59.9139],
  helsinki: [24.9384, 60.1699],
  copenhagen: [12.5683, 55.6761],
  warsaw: [21.0122, 52.2297],
  prague: [14.4378, 50.0755],
  budapest: [19.0402, 47.4979],
  bucharest: [26.1025, 44.4268],
  athens: [23.7275, 37.9838],
  lisbon: [-9.1393, 38.7223],
  dublin: [-6.2603, 53.3498],
  tokyo: [139.6917, 35.6895],
  osaka: [135.5023, 34.6937],
  kyoto: [135.7681, 35.0116],
  seoul: [126.978, 37.5665],
  busan: [129.0756, 35.1796],
  beijing: [116.4074, 39.9042],
  shanghai: [121.4737, 31.2304],
  guangzhou: [113.2644, 23.1291],
  shenzhen: [114.0579, 22.5431],
  "hong kong": [114.1694, 22.3193],
  taipei: [121.5654, 25.033],
  singapore: [103.8198, 1.3521],
  "kuala lumpur": [101.6869, 3.139],
  jakarta: [106.8456, -6.2088],
  surabaya: [112.7521, -7.2575],
  bandung: [107.6191, -6.9175],
  manila: [120.9842, 14.5995],
  sydney: [151.2093, -33.8688],
  melbourne: [144.9631, -37.8136],
  brisbane: [153.0251, -27.4698],
  perth: [115.8605, -31.9505],
  auckland: [174.7633, -36.8485],
  toronto: [-79.3832, 43.6532],
  montreal: [-73.5673, 45.5017],
  vancouver: [-123.1207, 49.2827],
  calgary: [-114.0719, 51.0447],
  "sao paulo": [-46.6333, -23.5505],
  "rio de janeiro": [-43.1729, -22.9068],
  "buenos aires": [-58.3816, -34.6037],
  santiago: [-70.6693, -33.4489],
  bogota: [-74.0721, 4.711],
  lima: [-77.0428, -12.0464],
  "mexico city": [-99.1332, 19.4326],
  cairo: [31.2357, 30.0444],
  dubai: [55.2708, 25.2048],
  "abu dhabi": [54.3773, 24.4539],
  riyadh: [46.7219, 24.6877],
  jeddah: [39.1979, 21.5433],
  doha: [51.531, 25.2854],
  kuwait: [47.9774, 29.3759],
  istanbul: [28.9784, 41.0082],
  ankara: [32.8597, 39.9334],
  moscow: [37.6173, 55.7558],
  "saint petersburg": [30.3351, 59.9343],
  johannesburg: [28.0473, -26.2041],
  "cape town": [18.4241, -33.9249],
  nairobi: [36.8219, -1.2921],
  lagos: [3.3792, 6.5244],
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
  name?: string;
  latitude?: number;
  longitude?: number;
}

interface RealtimeGeoMapProps {
  countryData?: MapCountryData[];
  height?: string;
  className?: string;
  mode?: "country" | "city";
}

export const RealtimeGeoMap: React.FC<RealtimeGeoMapProps> = ({
  countryData = [],
  height = "240px",
  className = "",
  mode = "country",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalCount = countryData.reduce((acc, c) => acc + (c.count || 0), 0);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLES.osm,
        center: [15, 15],
        zoom: 0,
        minZoom: 0,
        maxZoom: 14,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
        }),
        "bottom-right",
      );

      mapRef.current = map;

      const handleResize = () => {
        map.resize();
      };
      window.addEventListener("resize", handleResize);

      // Responsive container resize observer
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        window.removeEventListener("resize", handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    } catch (e) {
      console.error("MapLibre GL init error:", e);
    }
  }, []);

  // Coordinate resolver for countries, cities, or direct lat/lon
  const getCoordinates = useCallback(
    (
      code: string,
      cityName?: string,
      lat?: number,
      lon?: number,
    ): [number, number] => {
      if (typeof lon === "number" && typeof lat === "number") {
        return [lon, lat];
      }

      // Check city database if city provided
      if (cityName) {
        const cLower = cityName.toLowerCase().trim();
        if (CITY_COORDS[cLower]) {
          return CITY_COORDS[cLower];
        }

        // If city not found directly, offset from country center if country is known
        const upperCode = (code || "").toUpperCase().trim();
        const countryCoord = COUNTRY_COORDS[upperCode];
        if (countryCoord) {
          let hash = 0;
          for (let i = 0; i < cLower.length; i++) {
            hash = (hash << 5) - hash + cLower.charCodeAt(i);
            hash |= 0;
          }
          const offsetLon = ((Math.abs(hash * 19) % 120) - 60) / 40;
          const offsetLat = ((Math.abs(hash * 37) % 120) - 60) / 40;
          return [countryCoord[0] + offsetLon, countryCoord[1] + offsetLat];
        }
      }

      const upper = (code || "").toUpperCase().trim();
      if (COUNTRY_COORDS[upper]) {
        return COUNTRY_COORDS[upper];
      }

      // Deterministic fallback based on code/city letters
      const fallbackKey = cityName || upper || "unknown";
      let hash = 0;
      for (let i = 0; i < fallbackKey.length; i++) {
        hash = (hash << 5) - hash + fallbackKey.charCodeAt(i);
        hash |= 0;
      }
      const fLon = (Math.abs(hash * 37) % 320) - 160;
      const fLat = (Math.abs(hash * 73) % 110) - 45;
      return [fLon, fLat];
    },
    [],
  );

  // Sync Markers when countryData changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!countryData || countryData.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    countryData.forEach((item) => {
      const coords = getCoordinates(
        item.code,
        item.city,
        item.latitude,
        item.longitude,
      );
      bounds.extend(coords);
      const count = item.count || 0;

      // Color scheme based on traffic & mode
      const isCityMode = mode === "city" || Boolean(item.city);
      const isHigh = count >= 20;
      const isMedium = count >= 5;

      const pulseColor = isCityMode
        ? isHigh
          ? "bg-violet-500"
          : isMedium
            ? "bg-indigo-400"
            : "bg-cyan-400"
        : isHigh
          ? "bg-rose-500"
          : isMedium
            ? "bg-amber-400"
            : "bg-emerald-400";

      const badgeBg = isCityMode
        ? isHigh
          ? "bg-violet-600 text-white border-violet-300"
          : isMedium
            ? "bg-indigo-600 text-white border-indigo-300"
            : "bg-cyan-600 text-white border-cyan-200"
        : isHigh
          ? "bg-rose-600 text-white border-rose-300"
          : isMedium
            ? "bg-amber-500 text-slate-950 border-amber-300"
            : "bg-emerald-600 text-white border-emerald-300";

      // Create Custom Sleek DOM Marker
      const el = document.createElement("div");
      el.className = "group relative cursor-pointer select-none";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-4 w-4 rounded-full opacity-60 animate-ping ${pulseColor}"></span>
          <span class="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold font-mono shadow-sm border ${badgeBg} transition-transform transform group-hover:scale-125">
            ${count}
          </span>
        </div>
      `;

      // Popup
      const primaryTitle = item.city || item.country || item.name || "Location";
      const secondaryTitle = item.city ? item.country : (item.code || "");
      const percentage =
        totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0.0";

      const popupHtml = `
        <div style="font-family: inherit; font-size: 11px; padding: 2px 4px; min-width: 140px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
            <strong style="font-weight: 700; color: #1e293b;">${primaryTitle}</strong>
            ${secondaryTitle ? `<span style="font-family: monospace; font-size: 10px; background: #e2e8f0; padding: 1px 4px; border-radius: 4px; font-weight: 600;">${secondaryTitle}</span>` : ""}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #64748b;">Visitors:</span>
            <strong style="font-weight: 700; color: ${isCityMode ? "#4f46e5" : "#2563eb"};">${count}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Share:</span>
            <span style="font-weight: 600; color: #059669;">${percentage}%</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 12,
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

    // Fit bounds with comfortable zoom
    if (!bounds.isEmpty()) {
      try {
        map.fitBounds(bounds, {
          padding: 24,
          maxZoom: mode === "city" ? 1.5 : 0.75,
          duration: 400,
        });
      } catch (e) {
        map.setZoom(0);
      }
    }
  }, [countryData, getCoordinates, totalCount, mode]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleReset = () => {
    if (countryData && countryData.length > 0) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        countryData.forEach((item) => {
          bounds.extend(
            getCoordinates(
              item.code,
              item.city,
              item.latitude,
              item.longitude,
            ),
          );
        });
        if (!bounds.isEmpty()) {
          mapRef.current?.fitBounds(bounds, {
            padding: 24,
            maxZoom: mode === "city" ? 1.5 : 0.75,
            duration: 500,
          });
          return;
        }
      } catch {}
    }
    mapRef.current?.flyTo({
      center: [15, 15],
      zoom: 0,
      pitch: 0,
      bearing: 0,
      duration: 500,
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
          ? "fixed inset-0 z-50 rounded-none bg-[#aad3df] p-2"
          : "rounded-xl border border-slate-300/80 bg-[#aad3df]"
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Header Info */}

      {/* Control Buttons Group (Top Right) */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
        {/* OSM Badge */}

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
    </div>
  );
};
