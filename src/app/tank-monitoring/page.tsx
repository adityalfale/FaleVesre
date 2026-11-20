"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Cylinder,
  Plus,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Droplet,
  Gauge,
  X,
} from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { WaterTank } from "@/types";

export default function TankMonitoringPage() {
  const [tanks, setTanks] = useState<WaterTank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // New tank form state
  const [newTankName, setNewTankName] = useState("");
  const [newTankType, setNewTankType] = useState<WaterTank["tankType"]>("overhead");
  const [newTankCapacity, setNewTankCapacity] = useState("100000");

  const fetchTanks = async () => {
    try {
      const res = await fetch("/api/tanks?communityId=comm-01");
      const data = await res.json();
      setTanks(data);
      if (data.length > 0 && !selectedTankId) {
        setSelectedTankId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load tanks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, []);

  const handleUpdateLevel = async (tankId: string, newLevelLiters: number) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/tanks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tankId, currentLevelLiters: newLevelLiters }),
      });
      if (res.ok) {
        await fetchTanks();
      }
    } catch (err) {
      console.error("Failed to update tank level:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTankName || !newTankCapacity) return;

    try {
      const res = await fetch("/api/tanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTankName,
          tankType: newTankType,
          capacityLiters: Number(newTankCapacity),
          heightMeters: 4.5,
          currentLevelLiters: Number(newTankCapacity) * 0.75,
        }),
      });

      if (res.ok) {
        await fetchTanks();
        setShowAddModal(false);
        setNewTankName("");
      }
    } catch (err) {
      console.error("Failed to create tank:", err);
    }
  };

  const activeTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <Cylinder className="w-6 h-6 text-aqua-primary" />
              Overhead & Sump Water Tank Monitoring
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Ultrasonic telemetry, animated volume filling/draining, and low-level threshold protection.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5 text-aqua-cyan" />
            <span>Add Water Tank</span>
          </button>
        </div>

        {/* Tank Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tanks.map((tank) => (
            <div
              key={tank.id}
              onClick={() => setSelectedTankId(tank.id)}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-subtle hover:shadow-card ${
                selectedTankId === tank.id
                  ? "border-aqua-primary ring-2 ring-aqua-primary/20 shadow-md"
                  : "border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {tank.tankType.replace("_", " ")}
                  </span>
                  <h3 className="text-base font-bold text-navy-950 mt-0.5">{tank.name}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    tank.status === "critical"
                      ? "bg-rose-50 text-status-danger border-rose-200"
                      : tank.status === "low"
                      ? "bg-amber-50 text-status-warning border-amber-200"
                      : "bg-emerald-50 text-status-success border-emerald-200"
                  }`}
                >
                  {tank.status.toUpperCase()}
                </span>
              </div>

              {/* Animated Vertical Tank Visualizer */}
              <div className="my-6 flex items-center justify-center">
                <div className="relative w-36 h-52 rounded-2xl bg-slate-100 border-4 border-slate-300 overflow-hidden shadow-inner flex flex-col justify-end">
                  {/* Water Fill with Animated Wave Effect */}
                  <div
                    className={`w-full transition-all duration-1000 ease-in-out relative ${
                      tank.currentPercentage < 30
                        ? "bg-gradient-to-t from-rose-600 to-rose-400"
                        : tank.currentPercentage < 60
                        ? "bg-gradient-to-t from-amber-600 to-amber-400"
                        : "bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-400"
                    }`}
                    style={{ height: `${tank.currentPercentage}%` }}
                  >
                    {/* Ripple/Wave Line at the surface */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 blur-[1px] animate-pulse"></div>
                  </div>

                  {/* Ultrasonic Sensor Representation at top */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-6 h-2 rounded bg-slate-700"></div>
                    <Radio className="w-3 h-3 text-status-success mt-0.5 animate-ping" />
                  </div>

                  {/* Percentage in center of tank */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-navy-950 drop-shadow-md">
                      {tank.currentPercentage}%
                    </span>
                  </div>

                  {/* Calibration tick marks */}
                  <div className="absolute right-1 top-4 bottom-4 flex flex-col justify-between text-[8px] font-bold text-slate-400 pointer-events-none">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                </div>
              </div>

              {/* Stats below tank */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Volume:</span>
                  <span className="font-bold text-navy-900">
                    {formatNumber(tank.currentLevelLiters, 0)} L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Capacity:</span>
                  <span className="font-semibold text-slate-700">
                    {formatNumber(tank.capacityLiters, 0)} L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Deficit:</span>
                  <span className="font-semibold text-amber-700">
                    {formatNumber(tank.capacityLiters - tank.currentLevelLiters, 0)} L
                  </span>
                </div>
              </div>

              {/* Quick Fill / Drain Simulation Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateLevel(tank.id, Math.min(tank.capacityLiters, tank.currentLevelLiters + 15000));
                  }}
                  disabled={updating}
                  className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-status-success text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>+15kL Supply</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateLevel(tank.id, Math.max(0, tank.currentLevelLiters - 15000));
                  }}
                  disabled={updating}
                  className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>-15kL Consume</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Tank In-Depth Telemetry */}
        {activeTank && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-navy-950">
                  {activeTank.name} – Detailed Ultrasonic Telemetry
                </h2>
                <p className="text-xs text-slate-500">
                  High-frequency ultrasonic transceiver (IP68) with millimeter distance accuracy.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-status-success border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-ping"></span>
                  Sensor Online (ESP32-TANK-A102)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase block">
                  Liquid Height
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-navy-950">
                    {((activeTank.currentPercentage / 100) * activeTank.heightMeters).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ {activeTank.heightMeters} m</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">From tank floor datum</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase block">
                  Days of Reserve
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-aqua-primary">
                    {(activeTank.currentLevelLiters / 55000).toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">days</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">At average society consumption</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase block">
                  Tank Inflow Rate
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-navy-950">125</span>
                  <span className="text-xs font-bold text-slate-500">L/min</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">From primary borewells</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase block">
                  Sensor Signal RSSI
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-status-success">-58</span>
                  <span className="text-xs font-bold text-slate-500">dBm</span>
                </div>
                <span className="text-[10px] text-status-success font-medium block mt-1">
                  Excellent 2.4GHz Wi-Fi
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Water Tank */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Add Water Tank</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTank} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Tank Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tower C Overhead Tank"
                    value={newTankName}
                    onChange={(e) => setNewTankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Tank Type
                  </label>
                  <select
                    value={newTankType}
                    onChange={(e) => setNewTankType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="overhead">Overhead RCC / Sintex Reservoir</option>
                    <option value="underground_sump">Underground Concrete Sump</option>
                    <option value="ground_level">Ground Level Intermediate Tank</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Total Capacity (Litres)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    placeholder="e.g. 100000"
                    value={newTankCapacity}
                    onChange={(e) => setNewTankCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors"
                  >
                    Add Tank
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

