"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Play,
  Square,
  RotateCcw,
  Sliders,
  Layers,
  Radio,
  Clock,
  Droplet,
  Waves,
  Zap,
  Info,
  ChevronDown,
  Gauge,
  Activity,
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
import { formatNumber } from "@/lib/utils";

// Dynamically import Three.js scene to prevent SSR canvas issues
const BorewellScene = dynamic(
  () => import("@/components/borewell-3d/BorewellScene").then((mod) => mod.BorewellScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-3 border border-slate-200">
        <div className="w-10 h-10 border-4 border-aqua-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Initializing Three.js 3D Subsurface Engine...</p>
      </div>
    ),
  }
);

export default function BorewellMonitoringPage() {
  // Initial scientifically realistic resting baseline
  const RESTING_DEPTH = 14.8; // meters (depth to water)
  const TOTAL_BOREWELL_DEPTH = 185.0; // meters

  // Simulation state
  const [isPumping, setIsPumping] = useState(false);
  const [waterDepth, setWaterDepth] = useState(RESTING_DEPTH);
  const [pumpingRate, setPumpingRate] = useState(75); // Liters per minute
  const [simSpeed, setSimSpeed] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [totalExtractedLiters, setTotalExtractedLiters] = useState(0);
  const [pumpDurationSeconds, setPumpDurationSeconds] = useState(0);
  const [sensorMonitoringActive, setSensorMonitoringActive] = useState(true);
  const [showGeologicalLayers, setShowGeologicalLayers] = useState(true);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Historical telemetry log for the lower chart
  const [simHistory, setSimHistory] = useState<{ time: string; depth: number }[]>([
    { time: "00:00", depth: RESTING_DEPTH },
  ]);

  // Simulation step timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPumping) {
      interval = setInterval(() => {
        setPumpDurationSeconds((prev) => prev + 1);

        // Water extraction physics:
        // Litres extracted per second = (pumpingRate / 60) * simSpeed
        const extractedThisTick = (pumpingRate / 60) * simSpeed;
        setTotalExtractedLiters((prev) => Math.round(prev + extractedThisTick));

        // Drawdown physics:
        // Depth to water INCREASES scientifically as water is pumped out
        setWaterDepth((prev) => {
          const drawdownIncrement = 0.012 * simSpeed;
          const nextDepth = Number((prev + drawdownIncrement).toFixed(2));
          return Math.min(26.0, nextDepth); // Max cone of depression
        });
      }, 1000 / simSpeed);
    } else {
      // Natural groundwater recovery / recharge when pump is OFF (gradual, not instantaneous)
      interval = setInterval(() => {
        setWaterDepth((prev) => {
          if (prev > RESTING_DEPTH) {
            // Recharge recovery rate
            const recoveryIncrement = 0.008 * simSpeed;
            const nextDepth = Number((prev - recoveryIncrement).toFixed(2));
            return Math.max(RESTING_DEPTH, nextDepth);
          }
          return prev;
        });
      }, 1000 / simSpeed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPumping, pumpingRate, simSpeed]);

  // Log chart history every 3 seconds of pumping or recovery
  useEffect(() => {
    const historyTimer = setInterval(() => {
      const minutes = Math.floor(pumpDurationSeconds / 60);
      const seconds = pumpDurationSeconds % 60;
      const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      setSimHistory((prev) => {
        const next = [...prev, { time: timeLabel, depth: waterDepth }];
        if (next.length > 25) return next.slice(-25);
        return next;
      });
    }, 2000);

    return () => clearInterval(historyTimer);
  }, [pumpDurationSeconds, waterDepth]);

  // Reset simulation handler
  const handleReset = () => {
    setIsPumping(false);
    setWaterDepth(RESTING_DEPTH);
    setTotalExtractedLiters(0);
    setPumpDurationSeconds(0);
    setSimHistory([{ time: "00:00", depth: RESTING_DEPTH }]);
  };

  const waterColumnHeight = Number((TOTAL_BOREWELL_DEPTH - waterDepth).toFixed(2));

  // Determine scientific status indicator
  let aquiferStatus = "Aquifer Stable";
  let statusBadgeColor = "bg-emerald-50 text-status-success border-emerald-200";

  if (isPumping) {
    if (waterDepth > 22) {
      aquiferStatus = "Severe Cone Drawdown";
      statusBadgeColor = "bg-rose-50 text-status-danger border-rose-200";
    } else {
      aquiferStatus = "Pumping / Drawdown Active";
      statusBadgeColor = "bg-amber-50 text-status-warning border-amber-200";
    }
  } else if (waterDepth > RESTING_DEPTH) {
    aquiferStatus = "Recharge Recovery in Progress";
    statusBadgeColor = "bg-blue-50 text-aqua-primary border-blue-200";
  }

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Title Header with Mode Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
                3D Subsurface Borewell & Aquifer Simulation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Interactive 3D Cross-Section
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Physically-modelled underground vertical strata, submersible pump drawdown, and hydrostatic sensor monitoring.
            </p>
          </div>

          {/* Mode Pill: Live vs Simulation */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isPumping || waterDepth !== RESTING_DEPTH
                  ? "bg-amber-50 text-status-warning border-amber-300 shadow-xs"
                  : "bg-emerald-50 text-status-success border-emerald-300 shadow-xs"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>SIMULATION MODE (LABELED)</span>
            </div>
          </div>
        </div>

        {/* Real-time Scientific Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Depth to Water
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-navy-950">{waterDepth.toFixed(2)}</span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">From 0.0m surface ref</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Water Column
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-navy-950">{waterColumnHeight.toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Available borewell head</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pumping Rate
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-aqua-primary">{isPumping ? pumpingRate : 0}</span>
              <span className="text-xs font-bold text-slate-500">L/min</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">7.5 HP Submersible</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Extracted
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-navy-950">{formatNumber(totalExtractedLiters, 0)}</span>
              <span className="text-xs font-bold text-slate-500">L</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Accumulated volume</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pump Runtime
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-navy-950">{formatDuration(pumpDurationSeconds)}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Elapsed operation</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Aquifer Status
            </span>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadgeColor}`}>
                {aquiferStatus}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Dynamic calculation</span>
          </div>
        </div>

        {/* Main Simulation Area: 3D Scene + Controls Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Scene Viewport */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative">
              <BorewellScene
                isPumping={isPumping}
                waterDepth={waterDepth}
                waterColumn={waterColumnHeight}
                totalExtracted={totalExtractedLiters}
                pumpingRate={pumpingRate}
                showLayers={showGeologicalLayers}
                onHoverComponent={setHoveredLabel}
              />

              {/* Hover Tooltip Overlay in 3D Scene */}
              {hoveredLabel && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-navy-900/90 text-white text-xs font-medium backdrop-blur shadow-lg border border-navy-700 animate-in fade-in">
                  Component: <span className="text-aqua-cyan font-bold">{hoveredLabel}</span>
                </div>
              )}

              {/* Scientific Depth Relationship Guide Banner */}
              <div className="absolute top-4 right-4 z-20 max-w-xs p-2.5 rounded-lg bg-white/95 text-navy-900 text-[11px] backdrop-blur shadow-md border border-slate-200 hidden sm:block">
                <span className="font-bold text-navy-950 flex items-center gap-1 mb-0.5">
                  <Info className="w-3.5 h-3.5 text-aqua-primary" />
                  Hydrologic Rule:
                </span>
                Depth-to-water is measured downward from ground reference. When pumping: water table falls ➔ depth-to-water <span className="font-bold text-amber-700">INCREASES</span>.
              </div>
            </div>

            {/* Quick 3D Navigation Tips */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-4">
                <span>🖱️ <strong>Left Click + Drag:</strong> Rotate Cross-Section</span>
                <span>🔍 <strong>Scroll:</strong> Zoom Subsurface</span>
                <span>✋ <strong>Right Click + Drag:</strong> Pan</span>
              </div>
              <button
                onClick={() => setShowGeologicalLayers(!showGeologicalLayers)}
                className="text-aqua-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                {showGeologicalLayers ? "Hide Soil Strata" : "Show Soil Strata"}
              </button>
            </div>
          </div>

          {/* Interactive Simulation Controls Panel */}
          <div className="lg:col-span-1 p-5 rounded-xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-aqua-primary" />
                  Simulation Controls
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Trigger pumping & observe dynamic drawdown.</p>
              </div>

              {/* Pump Toggle Buttons */}
              <div className="space-y-2">
                {!isPumping ? (
                  <button
                    onClick={() => setIsPumping(true)}
                    className="w-full py-3 px-4 rounded-xl bg-status-success hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START BOREWELL PUMP</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPumping(false)}
                    className="w-full py-3 px-4 rounded-xl bg-status-danger hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>STOP PUMP (TRIGGER RECHARGE)</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-navy-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Natural Water Table</span>
                </button>
              </div>

              {/* Pumping Rate Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-navy-900">Discharge Flow Rate</span>
                  <span className="font-bold text-aqua-primary">{pumpingRate} L/min</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="140"
                  step="5"
                  value={pumpingRate}
                  onChange={(e) => setPumpingRate(Number(e.target.value))}
                  className="w-full accent-aqua-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>30 L/min</span>
                  <span>Typical: 75 L/min</span>
                  <span>140 L/min</span>
                </div>
              </div>

              {/* Simulation Speed Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-navy-900 block">Simulation Speed</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 5, 10].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        simSpeed === spd
                          ? "bg-navy-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Hydrostatic Telemetry Probe Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-navy-900 block">Digital Transducer</span>
                  <span className="text-[10px] text-slate-500">Live 4-20mA telemetry link</span>
                </div>
                <button
                  onClick={() => setSensorMonitoringActive(!sensorMonitoringActive)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    sensorMonitoringActive ? "bg-aqua-primary" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      sensorMonitoringActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Geological Reference Legend */}
            <div className="p-3 rounded-lg bg-slate-50 text-[11px] border border-slate-100 space-y-1">
              <span className="font-bold text-navy-900 block text-xs">Strata Classification</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4a2e18]"></span>
                <span className="text-slate-600">Topsoil / Humus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#854d0e]"></span>
                <span className="text-slate-600">Silty Clay Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#b45309]"></span>
                <span className="text-slate-600">Porous Sand & Gravel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#334155]"></span>
                <span className="text-slate-600">Granite Bedrock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]"></span>
                <span className="text-slate-600">Deep Saturated Aquifer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Real-time Drawdown Profile Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Subsurface Drawdown & Recovery Telemetry Curve
              </h2>
              <p className="text-xs text-slate-500">
                Dynamic Depth to Water (m). Observe the curve steepen during pumping and gradually flatten during aquifer recharge.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-50 text-aqua-primary border border-sky-200">
              Active Simulation Run
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#102A43", borderRadius: "8px", color: "#fff", fontSize: "12px", border: "none" }}
                  formatter={(value: any) => [`${value} meters`, "Depth to Water"]}
                />
                <Line
                  type="monotone"
                  dataKey="depth"
                  name="Depth to Water (m)"
                  stroke="#1769AA"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

