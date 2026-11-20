"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Waves,
  Plus,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDown,
  ArrowUp,
  Cpu,
  RefreshCw,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatNumber, formatDate, formatTime } from "@/lib/utils";
import { Borewell, GroundwaterReading } from "@/types";

export default function GroundwaterPage() {
  const [borewells, setBorewells] = useState<Borewell[]>([]);
  const [selectedBorewellId, setSelectedBorewellId] = useState<string>("bw-001");
  const [readings, setReadings] = useState<GroundwaterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // New reading form state
  const [manualDepth, setManualDepth] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New borewell form state
  const [newBwName, setNewBwName] = useState("");
  const [newBwDepth, setNewBwDepth] = useState("");
  const [newBwPower, setNewBwPower] = useState("7.5");

  const fetchBorewells = async () => {
    try {
      const res = await fetch("/api/borewells?communityId=comm-01");
      const data = await res.json();
      setBorewells(data);
      if (data.length > 0 && !selectedBorewellId) {
        setSelectedBorewellId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch borewells:", err);
    }
  };

  const fetchReadings = async (bwId: string) => {
    try {
      const res = await fetch(`/api/borewells/${bwId}/readings`);
      const data = await res.json();
      setReadings(data);
    } catch (err) {
      console.error("Failed to fetch readings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorewells();
  }, []);

  useEffect(() => {
    if (selectedBorewellId) {
      fetchReadings(selectedBorewellId);
    }
  }, [selectedBorewellId]);

  const handleLogManualReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDepth || !selectedBorewellId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/borewells/${selectedBorewellId}/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depthToWaterMeters: Number(manualDepth),
          source: "manual_verified",
          notes: manualNotes || "Manual sounding tape measurement",
        }),
      });

      if (res.ok) {
        await fetchReadings(selectedBorewellId);
        await fetchBorewells();
        setShowLogModal(false);
        setManualDepth("");
        setManualNotes("");
      }
    } catch (err) {
      console.error("Failed to submit reading:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBorewell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBwName || !newBwDepth) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/borewells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBwName,
          totalDepthMeters: Number(newBwDepth),
          pumpPowerHp: Number(newBwPower),
          currentDepthToWaterMeters: 15.0,
          source: "manual_verified",
        }),
      });

      if (res.ok) {
        await fetchBorewells();
        setShowAddModal(false);
        setNewBwName("");
        setNewBwDepth("");
      }
    } catch (err) {
      console.error("Failed to create borewell:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeBw = borewells.find((b) => b.id === selectedBorewellId) || borewells[0];

  const chartData = readings.map((r) => ({
    date: r.measuredAt.split("T")[0].slice(5),
    depthToWater: r.depthToWaterMeters,
    waterColumn: r.waterColumnMeters,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <Waves className="w-6 h-6 text-aqua-primary" />
              Groundwater & Aquifer Monitoring
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Precision depth-to-water logging, seasonal trend tracking, and verified hydrologic records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-aqua-primary" />
              <span>Record Manual Reading</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-aqua-cyan" />
              <span>Register New Borewell</span>
            </button>
          </div>
        </div>

        {/* Borewell Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {borewells.map((bw) => (
            <button
              key={bw.id}
              onClick={() => setSelectedBorewellId(bw.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                selectedBorewellId === bw.id
                  ? "bg-navy-900 text-white border-navy-900 shadow-md shadow-navy-900/10"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  bw.status === "active" ? "bg-status-success animate-pulse" : "bg-status-warning"
                }`}
              ></div>
              <span>{bw.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedBorewellId === bw.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {bw.currentDepthToWaterMeters}m
              </span>
            </button>
          ))}
        </div>

        {/* Selected Borewell Key Metrics */}
        {activeBw && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Depth to Water Table
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-navy-900">
                  {activeBw.currentDepthToWaterMeters}
                </span>
                <span className="text-sm font-bold text-slate-500">meters</span>
              </div>
              <span className="text-[11px] text-amber-600 font-semibold block mt-1">
                Measured downwards from 0.0m surface
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Remaining Water Column
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-aqua-primary">
                  {activeBw.currentWaterColumnMeters}
                </span>
                <span className="text-sm font-bold text-slate-500">meters</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Total Borewell Depth: {activeBw.totalDepthMeters}m
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Submersible Pump Rating
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-navy-900">
                  {activeBw.pumpPowerHp}
                </span>
                <span className="text-sm font-bold text-slate-500">HP</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Flow: {activeBw.pumpFlowRateLpm} L/min @ {activeBw.pumpInstalledDepthMeters}m depth
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Telemetry Source & Status
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                    activeBw.source === "sensor"
                      ? "bg-emerald-50 text-status-success border-emerald-200"
                      : "bg-blue-50 text-aqua-primary border-blue-200"
                  }`}
                >
                  {activeBw.source === "sensor" ? "🟢 Live Transducer" : "✓ Verified Manual"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1.5">
                Last ping: {formatTime(activeBw.lastUpdated)} - {formatDate(activeBw.lastUpdated)}
              </span>
            </div>
          </div>
        )}

        {/* Groundwater Depth History Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Groundwater Depth Curve</h2>
              <p className="text-xs text-slate-500">
                Depth to water table (m) and available water column (m) over time.
              </p>
            </div>
            <a
              href="/api/reports/export?type=groundwater&format=csv"
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-navy-900 shadow-xs flex items-center gap-1.5 transition-colors self-start"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV Readings</span>
            </a>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#102A43", borderRadius: "8px", color: "#fff", fontSize: "12px", border: "none" }}
                  itemStyle={{ color: "#22B8CF" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="depthToWater"
                  name="Depth to Water (m)"
                  stroke="#1769AA"
                  strokeWidth={2.5}
                  dot={{ fill: "#1769AA", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="waterColumn"
                  name="Water Column (m)"
                  stroke="#16A36A"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Readings Log Table */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Historical Telemetry Log</h2>
              <p className="text-xs text-slate-500">Persistent database readings recorded for this borewell.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {readings.length} total entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Depth to Water</th>
                  <th className="py-2.5 px-3">Water Column</th>
                  <th className="py-2.5 px-3">Water Temp</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readings.slice(-10).reverse().map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-navy-900">
                      {formatDate(r.measuredAt)} - {formatTime(r.measuredAt)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-navy-900">
                      {r.depthToWaterMeters} m
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-aqua-primary">
                      {r.waterColumnMeters} m
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {r.temperatureCelsius ? `${r.temperatureCelsius} °C` : "24.0 °C"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.source === "sensor"
                            ? "bg-emerald-50 text-status-success"
                            : "bg-blue-50 text-aqua-primary"
                        }`}
                      >
                        {r.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">
                      {r.notes || "Standard periodic telemetry"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Record Manual Reading */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Record Manual Groundwater Reading</h3>
                <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogManualReading} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Depth to Water Table (meters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15.25"
                    value={manualDepth}
                    onChange={(e) => setManualDepth(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Measured downward from ground level reference collar.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Notes / Observation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified with electric contact sounder tape"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-aqua-primary hover:bg-navy-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Measurement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Register New Borewell */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Register New Borewell</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBorewell} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Borewell Name / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Perimeter Deep Borewell #4"
                    value={newBwName}
                    onChange={(e) => setNewBwName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Total Drilled Depth (meters)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 175"
                    value={newBwDepth}
                    onChange={(e) => setNewBwDepth(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Pump Motor Capacity (HP)
                  </label>
                  <select
                    value={newBwPower}
                    onChange={(e) => setNewBwPower(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="3.0">3.0 HP</option>
                    <option value="5.0">5.0 HP</option>
                    <option value="7.5">7.5 HP (Standard Submersible)</option>
                    <option value="10.0">10.0 HP (High Yield)</option>
                  </select>
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
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Registering..." : "Register Borewell"}
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

