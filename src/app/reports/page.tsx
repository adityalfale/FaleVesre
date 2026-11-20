"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Waves,
  Cylinder,
  Truck,
  AlertTriangle,
  CloudRain,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("groundwater");
  const [dateRange, setDateRange] = useState<string>("30d");

  const REPORT_TYPES = [
    { id: "groundwater", title: "Groundwater Hydrologic Log", icon: Waves, desc: "Depth-to-water records, water column and sensor telemetry" },
    { id: "consumption", title: "Water Consumption Profile", icon: Cylinder, desc: "Daily, weekly and per-capita residential demand audit" },
    { id: "tanker", title: "Tanker Supply & Volume Audit", icon: Truck, desc: "Logistics, arrival timestamps and vendor delivery ledger" },
    { id: "leakage", title: "Community Leakage Incident Ledger", icon: AlertTriangle, desc: "Reported pipeline bursts, repair audit and water loss" },
    { id: "rainwater", title: "Rainwater Harvesting Yield Summary", icon: CloudRain, desc: "Catchment capacity, rooftop runoff and percolation audit" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-aqua-primary" />
              Intelligence Reports & Compliance Export
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Export verified telemetry data to CSV spreadsheets and print official regulatory reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Official PDF</span>
            </button>

            <a
              href={`/api/reports/export?type=${selectedReport}&format=csv`}
              className="px-4 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-aqua-cyan" />
              <span>Download CSV Spreadsheet</span>
            </a>
          </div>
        </div>

        {/* Report Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((rt) => {
            const Icon = rt.icon;
            const isSelected = selectedReport === rt.id;
            return (
              <div
                key={rt.id}
                onClick={() => setSelectedReport(rt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all shadow-subtle ${
                  isSelected
                    ? "bg-navy-900 text-white border-navy-900 shadow-md ring-2 ring-aqua-primary/30"
                    : "bg-white text-navy-950 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? "bg-white/10 text-aqua-cyan" : "bg-blue-50 text-aqua-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-snug">{rt.title}</h3>
                    <p
                      className={`text-xs mt-1 ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {rt.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Printable Official Report Preview Layout */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-6 printable-document">
          <div className="flex items-center justify-between pb-4 border-b-2 border-navy-900">
            <div>
              <span className="text-[11px] font-bold text-aqua-primary uppercase tracking-widest block">
                AQUASENSE AI • WATER INTELLIGENCE PLATFORM
              </span>
              <h2 className="text-xl font-black text-navy-950 mt-1 uppercase">
                Official Compliance & Hydro-Audit Statement
              </h2>
              <span className="text-xs text-slate-500 block mt-0.5">
                Community: Green Valley Eco Enclave (Code: GV-BLR-01)
              </span>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Date Generated: {formatDate(new Date().toISOString())}</div>
              <div>Audit Period: Past 30 Days</div>
              <div className="text-status-success font-semibold mt-1">✓ Digital Telemetry Authenticated</div>
            </div>
          </div>

          {/* Report Summary Data Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wide">
              Selected Report Section: {selectedReport.toUpperCase()}
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              This official hydro-audit compiles time-series readings gathered from calibrated ESP32 hydrostatic sensors, ultrasonic reservoir transceivers, gate-verified municipal tanker deliveries, and community water logs.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-navy-900 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Parameter Indicator</th>
                    <th className="p-2.5">Recorded Benchmark</th>
                    <th className="p-2.5">Regulatory Reference</th>
                    <th className="p-2.5">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-semibold text-navy-950">Groundwater Depth to Water</td>
                    <td className="p-2.5">14.8 meters below ground level</td>
                    <td className="p-2.5">&lt; 30.0m threshold</td>
                    <td className="p-2.5 text-status-success font-bold">NORMAL COMPLIANCE</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-navy-950">Daily Residential Consumption</td>
                    <td className="p-2.5">149.5 Litres / person / day (LPCD)</td>
                    <td className="p-2.5">BIS 1172 Standard: 135 LPCD</td>
                    <td className="p-2.5 text-amber-600 font-bold">MODERATE CONSERVATION NEEDED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-navy-950">Rainwater Recharge Utilization</td>
                    <td className="p-2.5">1.33 Million Litres recharged</td>
                    <td className="p-2.5">&gt; 1.0M Litres target</td>
                    <td className="p-2.5 text-status-success font-bold">EXCEEDED TARGET</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-navy-950">Resolved Leakage Ratio</td>
                    <td className="p-2.5">100% of reported leaks closed</td>
                    <td className="p-2.5">&lt; 48 hours resolution SLA</td>
                    <td className="p-2.5 text-status-success font-bold">100% SLA COMPLIANT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>AquaSense AI Ver 2.4.1 • Certified Environmental SaaS Engine</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

