"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  Droplet,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "@/types";

interface HeaderProps {
  currentRole: UserRole;
  onOpenMobileSidebar: () => void;
  communityName?: string;
}

export function Header({ currentRole, onOpenMobileSidebar, communityName = "Green Valley Eco Enclave" }: HeaderProps) {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-subtle">
      {/* Left side: Mobile menu toggle + Location & Date */}
      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-navy-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-navy-900">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-aqua-tint text-aqua-primary font-semibold text-xs border border-aqua-primary/20">
            <MapPin className="w-3.5 h-3.5 text-aqua-primary" />
            <span className="truncate max-w-[140px] md:max-w-[240px]">{communityName}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Right side: Telemetry badge + Notifications + Role Badge */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Real-time telemetry connection badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-status-success text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
          </span>
          <Radio className="w-3.5 h-3.5 text-status-success" />
          <span>Telemetry Active</span>
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[10px] font-bold text-white">
              2
            </span>
          </button>

          {/* Quick Notification Dropdown */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-navy-900">Active Water Alerts</span>
                <Link
                  href="/alerts"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-xs text-aqua-primary hover:underline font-medium"
                >
                  View All (3)
                </Link>
              </div>

              <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/50">
                  <AlertTriangle className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-navy-900">Groundwater Depth Increasing</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">North Borewell water column dropped 0.3m this week.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/50">
                  <CheckCircle2 className="w-4 h-4 text-aqua-primary flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-navy-900">Tanker Delivery Complete</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">12,000L replenished to Central Sump #2.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Today, 10:30 AM</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/alerts"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-xs text-slate-600 hover:text-navy-900 font-medium inline-flex items-center gap-1"
                >
                  Manage alert preferences <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-navy-900 text-xs font-semibold">
          <Droplet className="w-3.5 h-3.5 text-aqua-primary" />
          <span className="capitalize">{currentRole.replace("_", " ")}</span>
        </div>
      </div>
    </header>
  );
}

