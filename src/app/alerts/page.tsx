"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Filter,
  CheckCheck,
  Settings,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";
import { AlertNotification } from "@/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts?communityId=comm-01");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
        );
      }
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, communityId: "comm-01" }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-aqua-primary" />
              Water Alerts & Central Notification Desk
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Automated notifications for aquifer drawdown, low reservoir volume, telemetry faults and leaks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-status-success" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
          <div className="flex flex-wrap items-center gap-1.5">
            {["all", "critical", "warning", "info"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  severityFilter === sev
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Categories:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-aqua-primary"
            >
              <option value="all">All Categories</option>
              <option value="groundwater">Groundwater</option>
              <option value="tank_level">Tank Storage</option>
              <option value="leakage">Leakage</option>
              <option value="tanker">Tanker Logistics</option>
              <option value="device_offline">IoT Telemetry</option>
            </select>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No alerts match the selected criteria.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !alert.isRead
                    ? alert.severity === "critical"
                      ? "bg-rose-50/70 border-rose-300 shadow-xs"
                      : alert.severity === "warning"
                      ? "bg-amber-50/70 border-amber-300 shadow-xs"
                      : "bg-blue-50/70 border-blue-300 shadow-xs"
                    : "bg-white border-slate-200 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      alert.severity === "critical"
                        ? "bg-rose-100 text-status-danger"
                        : alert.severity === "warning"
                        ? "bg-amber-100 text-status-warning"
                        : "bg-blue-100 text-aqua-primary"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy-950">{alert.title}</h3>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          alert.severity === "critical"
                            ? "bg-rose-600 text-white"
                            : alert.severity === "warning"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-status-danger"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">{alert.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(alert.createdAt)}
                      </span>
                      <span className="capitalize font-semibold text-slate-500">
                        Category: {alert.category.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-navy-900 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

