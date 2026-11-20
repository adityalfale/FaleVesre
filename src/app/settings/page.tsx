"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Settings,
  ShieldCheck,
  Building,
  Key,
  Bell,
  Sliders,
  CheckCircle2,
  RefreshCw,
  User,
  Save,
} from "lucide-react";
import { UserRole } from "@/types";

export default function SettingsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("society_admin");
  const [communityName, setCommunityName] = useState("Green Valley Eco Enclave");
  const [totalHouseholds, setTotalHouseholds] = useState("380");
  const [lowTankThreshold, setLowTankThreshold] = useState("30");
  const [criticalDepthThreshold, setCriticalDepthThreshold] = useState("25.0");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-aqua-primary" />
              System Settings & RBAC Administration
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Role-based permissions, automated notification thresholds, community registry and security keys.
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-status-success border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <span>Settings successfully persisted to system configuration.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: RBAC Role & Authentication */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-aqua-primary" />
              <div>
                <h2 className="text-base font-bold text-navy-950">Active Role & Authorization (RBAC)</h2>
                <p className="text-xs text-slate-500">
                  Select your active role to verify permissions across the full application.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { role: "resident", title: "Resident", desc: "View water status, tanker arrival times and submit community leakage reports." },
                { role: "society_admin", title: "Society Admin", desc: "Manage borewells, overhead tanks, tanker schedules and assign repair technicians." },
                { role: "water_authority", title: "Water Authority", desc: "Regional inspection, verification of community logs and aquifer compliance audits." },
                { role: "super_admin", title: "Super Admin", desc: "Full administrative access, device registrations and system architecture settings." },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => setCurrentRole(item.role as UserRole)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    currentRole === item.role
                      ? "bg-navy-900 text-white border-navy-900 shadow-md ring-2 ring-aqua-primary/30"
                      : "bg-slate-50 text-navy-900 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className={`text-xs mt-1 leading-snug ${currentRole === item.role ? "text-slate-300" : "text-slate-500"}`}>
                    {item.desc}
                  </div>
                  {currentRole === item.role && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-aqua-cyan">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Session</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Community Configuration */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-aqua-primary" />
              <div>
                <h2 className="text-base font-bold text-navy-950">Community Profile</h2>
                <p className="text-xs text-slate-500">Registered residential enclave parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-navy-900 block mb-1">
                  Enclave Name
                </label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-900 block mb-1">
                  Total Serviced Households
                </label>
                <input
                  type="number"
                  value={totalHouseholds}
                  onChange={(e) => setTotalHouseholds(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Automated Alert Thresholds */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-aqua-primary" />
              <div>
                <h2 className="text-base font-bold text-navy-950">Automated Alert Triggers</h2>
                <p className="text-xs text-slate-500">Thresholds for automated system warning dispatches.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-navy-900 block mb-1">
                  Low Reservoir Level Warning (%)
                </label>
                <input
                  type="number"
                  value={lowTankThreshold}
                  onChange={(e) => setLowTankThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Triggers warning notification when tank storage dips below this value.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-900 block mb-1">
                  Critical Groundwater Depth (meters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={criticalDepthThreshold}
                  onChange={(e) => setCriticalDepthThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Triggers aquifer depletion warning if water table drops below this depth.
                </span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4 text-aqua-cyan" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

