"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Waves,
  Cylinder,
  Droplet,
  CloudRain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Truck,
  Activity,
  Layers,
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
} from "recharts";
import { formatNumber, formatDate, formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "monthly">("daily");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/dashboard/stats?communityId=comm-01");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-10 h-10 border-4 border-aqua-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading AquaSense telemetry & telemetry streams...</p>
        </div>
      </AppLayout>
    );
  }

  const { metrics, charts, tanks, recentAlerts, recentActivities } = data;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              Water Intelligence Overview
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Integrated real-time groundwater monitoring, storage telemetry & predictive conservation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-navy-900 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-aqua-primary" : "text-slate-600"}`} />
              <span>{refreshing ? "Refreshing..." : "Sync Sensors"}</span>
            </button>

            <Link
              href="/borewell-monitoring"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-aqua-primary hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Launch 3D Simulation</span>
            </Link>
          </div>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* 1. Current Groundwater Depth */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Depth to Water</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-aqua-primary">
                <Waves className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-navy-900">
                {metrics.currentGroundwaterDepth.value}
              </span>
              <span className="text-sm font-semibold text-slate-500">{metrics.currentGroundwaterDepth.unit}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                <TrendingDown className="w-3 h-3" />
                {metrics.currentGroundwaterDepth.trend}
              </span>
              <span className="text-slate-400 font-medium capitalize">
                {metrics.currentGroundwaterDepth.source.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* 2. Average Depth */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Aquifer Depth</span>
              <div className="p-1.5 rounded-lg bg-cyan-50 text-aqua-cyan">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-navy-900">
                {metrics.averageGroundwaterDepth.value}
              </span>
              <span className="text-sm font-semibold text-slate-500">{metrics.averageGroundwaterDepth.unit}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Across {metrics.averageGroundwaterDepth.totalCount} Borewells</span>
              <span className="text-status-success font-semibold">Verified</span>
            </div>
          </div>

          {/* 3. Active Borewells */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Borewells</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-status-success">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-navy-900">
                {metrics.activeBorewells.value}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ {metrics.activeBorewells.total}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-status-success font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping"></span>
                Pump Operational
              </span>
              <span>1 Maint.</span>
            </div>
          </div>

          {/* 4. Tank Water Availability */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tank Storage</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Cylinder className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-navy-900">
                {metrics.tankAvailability.percentage}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({formatNumber(metrics.tankAvailability.currentLiters / 1000, 0)}kL)
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-aqua-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.tankAvailability.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* 5. Today's Water Consumption */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Today's Demand</span>
              <div className="p-1.5 rounded-lg bg-sky-50 text-aqua-primary">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-navy-900">
                {formatNumber(metrics.todayConsumption.value, 0)}
              </span>
              <span className="text-sm font-semibold text-slate-500">{metrics.todayConsumption.unit}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className={`font-medium flex items-center gap-0.5 ${metrics.todayConsumption.trendPercent > 0 ? "text-amber-600" : "text-status-success"}`}>
                {metrics.todayConsumption.trendPercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metrics.todayConsumption.trendPercent}% vs yesterday
              </span>
            </div>
          </div>

          {/* 6. Rainfall Recorded */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Rainfall (30d)</span>
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-navy-900">
                {metrics.rainfallRecorded.value}
              </span>
              <span className="text-xs font-semibold text-slate-500">mm</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 truncate">
              Recharge: <span className="font-semibold text-status-success">{formatNumber(metrics.rainfallRecorded.rechargePotentialLiters, 0)} L</span>
            </div>
          </div>
        </div>

        {/* Charts Section: Groundwater Trend + Water Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groundwater Trend Chart */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-navy-900">Groundwater Depth Profile</h2>
                <p className="text-xs text-slate-500">
                  Depth to water table (meters below surface). Note: Higher value indicates deeper/depleted water level.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                <button
                  onClick={() => setTimeFilter("daily")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${timeFilter === "daily" ? "bg-white text-navy-900 font-semibold shadow-xs" : "hover:text-navy-900"}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeFilter("weekly")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${timeFilter === "weekly" ? "bg-white text-navy-900 font-semibold shadow-xs" : "hover:text-navy-900"}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeFilter("monthly")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${timeFilter === "monthly" ? "bg-white text-navy-900 font-semibold shadow-xs" : "hover:text-navy-900"}`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.groundwaterTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#102A43", borderRadius: "8px", color: "#fff", fontSize: "12px", border: "none" }}
                    itemStyle={{ color: "#22B8CF" }}
                    formatter={(value: any) => [`${value} meters`, "Depth to Water"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="depthToWater"
                    name="Depth to Water (m)"
                    stroke="#1769AA"
                    strokeWidth={2.5}
                    dot={{ fill: "#1769AA", r: 3 }}
                    activeDot={{ r: 6, fill: "#22B8CF" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-aqua-primary inline-block"></span>
                North Borewell Hydrostatic Telemetry
              </span>
              <Link href="/groundwater" className="text-aqua-primary hover:underline font-semibold flex items-center gap-1">
                View All Readings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Water Consumption Chart */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-navy-900">Daily Water Consumption</h2>
                <p className="text-xs text-slate-500">Past 7 days residential consumption in Litres.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-status-success border border-emerald-200/60">
                Normal Usage
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.consumptionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#102A43", borderRadius: "8px", color: "#fff", fontSize: "12px", border: "none" }}
                    formatter={(value: any) => [`${formatNumber(Number(value), 0)} Litres`, "Consumption"]}
                  />
                  <Bar dataKey="liters" fill="#1769AA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Avg Daily: 56,800 Litres (149 LPCD)</span>
              <Link href="/analytics" className="text-aqua-primary hover:underline font-semibold flex items-center gap-1">
                Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Visual Tank Indicators & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Tank Storage Levels */}
          <div className="lg:col-span-1 p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-navy-900">Reservoir Levels</h2>
                <Link href="/tank-monitoring" className="text-xs text-aqua-primary font-semibold hover:underline">
                  Manage Tanks
                </Link>
              </div>

              <div className="space-y-4">
                {tanks.map((tank: any) => (
                  <div key={tank.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-navy-900 truncate">{tank.name}</span>
                      <span className={`font-bold ${tank.currentPercentage < 30 ? "text-status-danger" : tank.currentPercentage < 60 ? "text-status-warning" : "text-status-success"}`}>
                        {tank.currentPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          tank.currentPercentage < 30 ? "bg-status-danger" : tank.currentPercentage < 60 ? "bg-status-warning" : "bg-aqua-primary"
                        }`}
                        style={{ width: `${tank.currentPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span className="capitalize">{tank.type.replace("_", " ")}</span>
                      <span>{formatNumber(tank.currentLevelLiters / 1000, 0)} / {formatNumber(tank.capacityLiters / 1000, 0)} kL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link
                href="/tank-monitoring"
                className="w-full py-2 px-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Cylinder className="w-3.5 h-3.5" />
                <span>Open 3D Tank Visualizer</span>
              </Link>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="lg:col-span-1 p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy-900">Active Alerts</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {recentAlerts.length}
                </span>
              </div>
              <Link href="/alerts" className="text-xs text-aqua-primary font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.severity === "critical"
                      ? "bg-rose-50/60 border-rose-200/70"
                      : alert.severity === "warning"
                      ? "bg-amber-50/60 border-amber-200/70"
                      : "bg-blue-50/60 border-blue-200/70"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        alert.severity === "critical"
                          ? "text-status-danger"
                          : alert.severity === "warning"
                          ? "text-status-warning"
                          : "text-aqua-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 leading-snug">{alert.title}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{alert.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatTime(alert.createdAt)} - {formatDate(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Feed & Tanker Highlights */}
          <div className="lg:col-span-1 p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy-900">Community Activity</h2>
              <Link href="/community-logs" className="text-xs text-aqua-primary font-semibold hover:underline">
                Logs Hub
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.map((log: any) => (
                <div key={log.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-navy-900">{log.authorName}</span>
                    <span className="text-[10px]">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="font-semibold text-navy-900 text-xs">{log.title}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{log.content}</p>
                  {log.isVerified && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-status-success font-medium">
                      <CheckCircle2 className="w-3 h-3 text-status-success" />
                      <span>Verified by Society Admin</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/report-leakage"
                className="w-full py-2 px-3 rounded-lg border border-dashed border-status-danger/40 bg-rose-50/40 hover:bg-rose-50 text-status-danger text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Water Leakage / Loss</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

