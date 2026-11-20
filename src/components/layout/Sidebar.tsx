"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Waves,
  BarChart3,
  Box,
  Cylinder,
  Truck,
  CloudRain,
  BrainCircuit,
  Bell,
  AlertTriangle,
  FileText,
  BookOpen,
  Cpu,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ShieldCheck,
  User,
} from "lucide-react";
import { UserRole } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: "OVERVIEW",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "AQUA MAP", href: "/aqua-map", icon: MapPin },
      { title: "Groundwater", href: "/groundwater", icon: Waves },
      { title: "Water Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    groupName: "WATER MANAGEMENT",
    items: [
      { title: "Borewell 3D Sim", href: "/borewell-monitoring", icon: Box, badge: "3D Sim" },
      { title: "Tank Monitoring", href: "/tank-monitoring", icon: Cylinder },
      { title: "Tanker Supply", href: "/tanker-schedule", icon: Truck },
      { title: "Rainwater Harvesting", href: "/rainwater-harvesting", icon: CloudRain },
    ],
  },
  {
    groupName: "INTELLIGENCE",
    items: [
      { title: "AI Water Prediction", href: "/ai-prediction", icon: BrainCircuit, badge: "AI" },
      { title: "Alerts & Notifications", href: "/alerts", icon: Bell },
    ],
  },
  {
    groupName: "COMMUNITY",
    items: [
      { title: "Report Leakage", href: "/report-leakage", icon: AlertTriangle },
      { title: "Community Water Logs", href: "/community-logs", icon: FileText },
      { title: "Conservation Hub", href: "/conservation", icon: BookOpen },
    ],
  },
  {
    groupName: "ADMINISTRATION",
    items: [
      { title: "Sensors & Devices", href: "/devices", icon: Cpu },
      { title: "Reports & Export", href: "/reports", icon: FileSpreadsheet },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ currentRole, onRoleChange, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-navy-900 text-white transition-all duration-300 ease-in-out border-r border-navy-800 ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-navy-800/80 bg-navy-950/60">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-aqua-primary to-aqua-cyan text-white shadow-md shadow-aqua-primary/30 flex-shrink-0">
              <Droplets className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-wider text-white truncate font-sans">
                  AQUASENSE <span className="text-aqua-cyan">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium truncate">
                  Smart Water Intel
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupName} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400/90 uppercase">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? "bg-aqua-primary text-white shadow-md shadow-aqua-primary/30 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-navy-800/80"
                    }`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-aqua-cyan"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-aqua-cyan/20 text-aqua-cyan group-hover:bg-aqua-cyan/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-navy-950 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {item.title}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Role & Profile Switcher Footer */}
        <div className="p-3 border-t border-navy-800/80 bg-navy-950/70">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-aqua-cyan/40">
                  <User className="w-4 h-4 text-aqua-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Suresh Menon</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-status-success" />
                    <span className="capitalize">{currentRole.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              {/* Quick Role Switcher for Testing Full RBAC Functionality */}
              <div className="pt-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Active Role (RBAC):
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="w-full bg-navy-800 text-xs text-white border border-navy-700 rounded-md px-2 py-1 focus:outline-none focus:border-aqua-cyan"
                >
                  <option value="resident">Resident</option>
                  <option value="society_admin">Society Administrator</option>
                  <option value="water_authority">Water Authority</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`Logged in as ${currentRole}`}>
              <div className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center text-aqua-cyan">
                <User className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

