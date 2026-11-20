"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
  Droplet,
  CloudRain,
  ShieldCheck,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { formatNumber } from "@/lib/utils";

const CORRELATION_DATA = [
  { month: "Jun", rainfallMm: 45, avgDepth: 14.1, consumptionKl: 1650 },
  { month: "Jul", rainfallMm: 120, avgDepth: 13.8, consumptionKl: 1520 },
  { month: "Aug", rainfallMm: 180, avgDepth: 13.4, consumptionKl: 1480 },
  { month: "Sep", rainfallMm: 95, avgDepth: 13.7, consumptionKl: 1540 },
  { month: "Oct", rainfallMm: 110, avgDepth: 13.9, consumptionKl: 1580 },
  { month: "Nov", rainfallMm: 25, avgDepth: 14.8, consumptionKl: 1690 },
];

const SUPPLY_DEMAND_DATA = [
  { day: "Mon", borewellLiters: 45000, tankerLiters: 12000, demandLiters: 54000 },
  { day: "Tue", borewellLiters: 48000, tankerLiters: 0, demandLiters: 49000 },
  { day: "Wed", borewellLiters: 46000, tankerLiters: 12000, demandLiters: 56000 },
  { day: "Thu", borewellLiters: 50000, tankerLiters: 0, demandLiters: 51000 },
  { day: "Fri", borewellLiters: 47000, tankerLiters: 15000, demandLiters: 60000 },
  { day: "Sat", borewellLiters: 52000, tankerLiters: 24000, demandLiters: 68000 },
  { day: "Sun", borewellLiters: 50000, tankerLiters: 24000, demandLiters: 69000 },
];

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-aqua-primary" />
              Advanced Water Intelligence Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Multi-dimensional hydrologic modeling: rainfall vs aquifer depth correlation, and net supply-demand equilibrium.
            </p>
          </div>

          <a
            href="/api/reports/export?type=consumption&format=csv"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Analytics CSV</span>
          </a>
        </div>

        {/* 4 Key Efficiency KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Net Supply vs Demand Balance
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-status-success">+4,800</span>
              <span className="text-xs font-bold text-slate-500">L / day avg</span>
            </div>
            <span className="text-[11px] text-status-success font-medium block mt-1">
              Surplus stored in overhead reservoirs
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Groundwater Extraction Ratio
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-aqua-primary">76.5%</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              23.5% met via tanker & rainwater
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Per Capita Consumption
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-navy-950">149.5</span>
              <span className="text-xs font-bold text-slate-500">LPCD</span>
            </div>
            <span className="text-[11px] text-amber-600 font-semibold block mt-1">
              +14.5 LPCD above national benchmark
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Rainfall Infiltration Index
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-purple-700">0.72</span>
            </div>
            <span className="text-[11px] text-status-success font-medium block mt-1">
              Optimal recharge percolation speed
            </span>
          </div>
        </div>

        {/* Chart 1: Supply vs Demand Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-950">
                Weekly Water Supply vs Residential Demand Equilibrium
              </h2>
              <p className="text-xs text-slate-500">
                Comparison of Borewell Inflow, Tanker Replenishment and Total Residential Consumption.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-aqua-primary border border-blue-200">
              Balanced System
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUPPLY_DEMAND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#102A43", borderRadius: "8px", color: "#fff", fontSize: "12px", border: "none" }}
                  formatter={(val: any) => [`${formatNumber(Number(val), 0)} L`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="borewellLiters" name="Borewell Yield (L)" fill="#1769AA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tankerLiters" name="Tanker Supply (L)" fill="#22B8CF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demandLiters" name="Resident Demand (L)" fill="#E9A23B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rainfall vs Groundwater Depth Correlation */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-950">
                Seasonal Rainfall vs Aquifer Depth Correlation
              </h2>
              <p className="text-xs text-slate-500">
                Notice how heavy monsoon precipitation in July/August correlates with rising water table (lower depth-to-water numbers).
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CORRELATION_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#16A36A" fontSize={11} tickLine={false} unit="mm" />
                <YAxis yAxisId="right" orientation="right" stroke="#1769AA" fontSize={11} tickLine={false} unit="m" domain={[12, 16]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#102A43", borderRadius: "8px", color: "#fff", fontSize: "12px", border: "none" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="rainfallMm"
                  name="Monthly Rainfall (mm)"
                  fill="#16A36A"
                  fillOpacity={0.15}
                  stroke="#16A36A"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgDepth"
                  name="Depth to Water (m)"
                  stroke="#1769AA"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#1769AA" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

