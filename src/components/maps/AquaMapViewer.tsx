"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Create custom SVG Leaflet icons for each water entity type
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        transform: translate(-50%, -50%);
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const ICONS = {
  borewell: createCustomIcon("#1769AA", "💧"),
  water_tank: createCustomIcon("#0284c7", "🛢️"),
  rainwater_harvesting: createCustomIcon("#16A36A", "🌧️"),
  leakage: createCustomIcon("#DC5555", "⚠️"),
};

interface LocationPoint {
  id: string;
  name: string;
  type: "borewell" | "water_tank" | "rainwater_harvesting" | "leakage";
  latitude: number;
  longitude: number;
  depthMeters?: number;
  status: string;
  source: string;
  updatedAt: string;
  riskLevel: "normal" | "declining" | "critical" | "insufficient_data";
}

interface AquaMapViewerProps {
  locations: LocationPoint[];
  selectedLocation: LocationPoint | null;
  onSelectLocation: (loc: LocationPoint) => void;
  center: [number, number];
  zoom: number;
}

// Map helper to center on selected location
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function AquaMapViewer({
  locations,
  selectedLocation,
  onSelectLocation,
  center,
  zoom,
}: AquaMapViewerProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl z-0"
      >
        <ChangeMapView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((loc) => {
          const icon = ICONS[loc.type] || ICONS.borewell;
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLocation(loc),
              }}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-navy-900">{loc.name}</div>
                  <div className="text-slate-500 capitalize">{loc.type.replace("_", " ")}</div>
                  {loc.depthMeters !== undefined && (
                    <div className="mt-1 font-semibold text-aqua-primary">
                      Depth: {loc.depthMeters}m
                    </div>
                  )}
                  <button
                    onClick={() => onSelectLocation(loc)}
                    className="mt-2 text-[10px] font-bold text-white bg-navy-900 hover:bg-navy-800 px-2 py-1 rounded w-full"
                  >
                    View Intelligence Panel
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

