"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Waves,
  Cylinder,
  CloudRain,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";

// Leaflet dynamic import for client-side rendering
const AquaMapViewer = dynamic(
  () => import("@/components/maps/AquaMapViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-3 border border-slate-200">
        <div className="w-10 h-10 border-4 border-aqua-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Loading AQUA MAP GIS Geospatial Layers...</p>
      </div>
    ),
  }
);

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

const INITIAL_MAP_LOCATIONS: LocationPoint[] = [
  {
    id: "loc-01",
    name: "North Gate Deep Borewell #1",
    type: "borewell",
    latitude: 12.9355,
    longitude: 77.7292,
    depthMeters: 14.8,
    status: "active",
    source: "sensor",
    updatedAt: new Date().toISOString(),
    riskLevel: "declining",
  },
  {
    id: "loc-02",
    name: "South Garden Recharge Borewell #2",
    type: "borewell",
    latitude: 12.9348,
    longitude: 77.7305,
    depthMeters: 16.2,
    status: "active",
    source: "manual_verified",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    riskLevel: "normal",
  },
  {
    id: "loc-03",
    name: "Central Overhead Tank Tower A",
    type: "water_tank",
    latitude: 12.9354,
    longitude: 77.7299,
    status: "optimal (75%)",
    source: "sensor",
    updatedAt: new Date().toISOString(),
    riskLevel: "normal",
  },
  {
    id: "loc-04",
    name: "Clubhouse Rainwater Harvesting Sump",
    type: "rainwater_harvesting",
    latitude: 12.9351,
    longitude: 77.7302,
    status: "harvesting active",
    source: "manual_verified",
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    riskLevel: "normal",
  },
  {
    id: "loc-05",
    name: "Block C Main Flange Leakage",
    type: "leakage",
    latitude: 12.9350,
    longitude: 77.7295,
    status: "in_progress",
    source: "community_unverified",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    riskLevel: "critical",
  },
];

// Historical mini chart data for selected location
const LOCATION_CHART_MOCK = [
  { date: "Nov 01", depth: 14.2 },
  { date: "Nov 05", depth: 14.4 },
  { date: "Nov 10", depth: 14.6 },
  { date: "Nov 15", depth: 14.7 },
  { date: "Nov 20", depth: 14.8 },
];

export default function AquaMapPage() {
  const [locations, setLocations] = useState<LocationPoint[]>(INITIAL_MAP_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(INITIAL_MAP_LOCATIONS[0]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9352, 77.7298]);
  const [mapZoom, setMapZoom] = useState<number>(17);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding new location
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState<LocationPoint["type"]>("borewell");
  const [newLocDepth, setNewLocDepth] = useState("");

  const filteredLocations = locations.filter((loc) => {
    if (activeFilter !== "all" && loc.type !== activeFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return loc.name.toLowerCase().includes(q) || loc.type.toLowerCase().includes(q);
    }
    return true;
  });

  // Current Location Geolocation
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(coords);
          setMapZoom(16);
        },
        (err) => {
          alert("Geolocation permission denied or unavailable. Centering on default community coordinates.");
        }
      );
    }
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName) return;

    const newLoc: LocationPoint = {
      id: `loc-${Date.now()}`,
      name: newLocName,
      type: newLocType,
      latitude: mapCenter[0] + (Math.random() - 0.5) * 0.002,
      longitude: mapCenter[1] + (Math.random() - 0.5) * 0.002,
      depthMeters: newLocDepth ? Number(newLocDepth) : undefined,
      status: "active",
      source: "manual_verified",
      updatedAt: new Date().toISOString(),
      riskLevel: "normal",
    };

    setLocations((prev) => [newLoc, ...prev]);
    setSelectedLocation(newLoc);
    setShowAddModal(false);
    setNewLocName("");
    setNewLocDepth("");
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Map Header with Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-aqua-primary" />
              AQUA MAP – Geospatial Water Intelligence
            </h1>
            <p className="text-xs text-slate-500">
              Interactive GIS mapping of borewells, overhead tanks, rainwater harvesting sumps and real-time community leaks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseCurrentLocation}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-aqua-primary" />
              <span>Current GPS Location</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-aqua-cyan" />
              <span>Add Water Point</span>
            </button>
          </div>
        </div>

        {/* Search bar & filter pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search borewell, tank, street, locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-aqua-primary focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Points", icon: Filter },
              { id: "borewell", label: "Borewells", icon: Waves },
              { id: "water_tank", label: "Tanks", icon: Cylinder },
              { id: "rainwater_harvesting", label: "Rainwater", icon: CloudRain },
              { id: "leakage", label: "Leaks", icon: AlertTriangle },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === f.id
                      ? "bg-navy-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Map Container + Slide-out Details Panel */}
        <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-slate-200 shadow-card">
          <AquaMapViewer
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            center={mapCenter}
            zoom={mapZoom}
          />

          {/* Slide-out Location Detail Panel */}
          {selectedLocation && (
            <div className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-dropdown border border-slate-200 p-5 z-20 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      {selectedLocation.type.replace("_", " ")}
                    </span>
                    <h3 className="text-base font-bold text-navy-950 mt-0.5 leading-snug">
                      {selectedLocation.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Depth Measurement (if borewell) */}
                {selectedLocation.depthMeters !== undefined && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold uppercase block">
                      Groundwater Depth
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-black text-navy-900">
                        {selectedLocation.depthMeters}
                      </span>
                      <span className="text-sm font-bold text-slate-500">meters</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-amber-600 font-semibold">Seasonal Drawdown Active</span>
                      <span className="text-slate-400">Total depth: 185m</span>
                    </div>
                  </div>
                )}

                {/* Source Verification Badge */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-navy-900 block">Measurement Provenance</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        selectedLocation.source === "sensor"
                          ? "bg-emerald-50 text-status-success border-emerald-200"
                          : selectedLocation.source === "manual_verified"
                          ? "bg-blue-50 text-aqua-primary border-blue-200"
                          : selectedLocation.source === "ai_estimate"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-amber-50 text-status-warning border-amber-200"
                      }`}
                    >
                      {selectedLocation.source === "sensor"
                        ? "🟢 Live Submersible Sensor"
                        : selectedLocation.source === "manual_verified"
                        ? "✓ Verified Authority Reading"
                        : selectedLocation.source === "ai_estimate"
                        ? "✨ AI Hydrologic Estimate"
                        : "⚠️ Unverified Community Submission"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Updated: {formatDate(selectedLocation.updatedAt)}
                  </span>
                </div>

                {/* Historical Trend Chart */}
                <div>
                  <span className="text-xs font-bold text-navy-900 block mb-2">Historical Trend Profile</span>
                  <div className="h-32 w-full bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={LOCATION_CHART_MOCK}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                        <YAxis domain={['auto', 'auto']} fontSize={10} stroke="#94a3b8" unit="m" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="depth"
                          stroke="#1769AA"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Nearby Water Points */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-navy-900 block">Nearby Water Infrastructure</span>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span>Overhead Tank Tower A</span>
                      <span className="font-semibold text-aqua-primary">45m north</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span>Rainwater Recharge Sump</span>
                      <span className="font-semibold text-aqua-primary">90m east</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <button
                  onClick={() => alert(`Detailed inspection log for ${selectedLocation.name} downloaded.`)}
                  className="w-full py-2 px-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors text-center"
                >
                  Download Geo-Telemetry Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal for adding new water monitoring point */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Add Monitoring Location</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-navy-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLocation} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Point Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Gate Borewell #3"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Infrastructure Type
                  </label>
                  <select
                    value={newLocType}
                    onChange={(e) => setNewLocType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="borewell">Groundwater Borewell</option>
                    <option value="water_tank">Overhead / Sump Water Tank</option>
                    <option value="rainwater_harvesting">Rainwater Harvesting Unit</option>
                    <option value="leakage">Reported Water Leakage</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Groundwater Depth (Optional, in meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.5"
                    value={newLocDepth}
                    onChange={(e) => setNewLocDepth(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-aqua-primary hover:bg-navy-800 text-white text-xs font-semibold transition-colors"
                  >
                    Save to Aqua Map
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

