"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BookOpen,
  Droplet,
  Waves,
  CloudRain,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Users,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function ConservationHubPage() {
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [hasAerators, setHasAerators] = useState<boolean>(true);
  const [hasDualFlush, setHasDualFlush] = useState<boolean>(true);
  const [roWasteRecovery, setRoWasteRecovery] = useState<boolean>(false);

  // Household Water Audit Calculation
  // Standard baseline: 135 Litres Per Capita per Day (LPCD)
  const baselineMonthly = householdSize * 135 * 30;
  let savingsPercentage = 0;
  if (hasAerators) savingsPercentage += 18;
  if (hasDualFlush) savingsPercentage += 12;
  if (roWasteRecovery) savingsPercentage += 15;

  const actualMonthly = Math.round(baselineMonthly * (1 - savingsPercentage / 100));
  const savedLitersMonthly = baselineMonthly - actualMonthly;

  const CONSERVATION_GUIDELINES = [
    {
      category: "Household Water-Saving Actions",
      icon: Droplet,
      color: "text-aqua-primary bg-blue-50",
      tips: [
        { title: "Install 3 LPM Sink Aerators", impact: "Saves up to 1,200 Litres per apartment monthly", desc: "Aerators inject micro-bubbles into flow streams, reducing volume consumption by 45% without compromising rinsing velocity." },
        { title: "Dual-Flush Toilet Cisterns (3L / 6L)", impact: "Saves 30 Litres per resident daily", desc: "Replaces traditional 10-litre gravity flushes with dual-volume pneumatics." },
        { title: "RO Rejection Water Utilization", impact: "Recovers 35-50 Litres daily per home", desc: "Route mineral reject brine directly into utility buckets for floor mopping, utensil pre-soaking and toilet flushing." },
      ],
    },
    {
      category: "Groundwater & Aquifer Best Practices",
      icon: Waves,
      color: "text-status-success bg-emerald-50",
      tips: [
        { title: "Stagger Borewell Pumping Intervals", impact: "Prevents severe cone drawdown and casing cavitation", desc: "Operate pumps for two 90-minute intervals rather than a continuous 3-hour cycle, allowing natural recharge stabilization." },
        { title: "Install Automated Dry-Run Protection Relays", impact: "Protects pump motor from silt burnout", desc: "Ensures submersible motor automatically disengages if water table drops below intake strainer depth." },
      ],
    },
    {
      category: "Housing Society Guidelines",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
      tips: [
        { title: "Smart Sub-Metering per Apartment", impact: "Typically yields 25% voluntary reduction", desc: "Individual consumption visibility encourages prompt reporting of internal plumbing leaks." },
        { title: "Centralized STP Treated Water for Landscaping", impact: "Eliminates fresh water use for lawns", desc: "Recycle tertiary-treated water for all garden irrigation and car wash bays." },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-aqua-primary" />
              Water Conservation & Educational Intelligence Hub
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Empirical household water audit calculator, aquifer preservation protocols and community benchmarks.
            </p>
          </div>
        </div>

        {/* Interactive Household Water Audit Calculator */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
            <div className="p-2 rounded-lg bg-blue-50 text-aqua-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">
                Apartment Water Consumption & Conservation Audit
              </h2>
              <p className="text-xs text-slate-500">
                Calculate your household monthly water footprint and see the real-world litres saved by modern fixtures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-navy-900 flex justify-between mb-1">
                  <span>Number of Family Residents</span>
                  <span className="text-aqua-primary font-black">{householdSize} persons</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full accent-aqua-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-navy-900 block">Conservation Fixtures Installed:</span>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAerators}
                    onChange={(e) => setHasAerators(e.target.checked)}
                    className="accent-aqua-primary rounded"
                  />
                  <span>Low-flow Faucet Aerators (3 LPM) (-18%)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDualFlush}
                    onChange={(e) => setHasDualFlush(e.target.checked)}
                    className="accent-aqua-primary rounded"
                  />
                  <span>Dual-Flush Toilet Cisterns (-12%)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roWasteRecovery}
                    onChange={(e) => setRoWasteRecovery(e.target.checked)}
                    className="accent-aqua-primary rounded"
                  />
                  <span>RO Filter Reject Water Recovery (-15%)</span>
                </label>
              </div>
            </div>

            {/* Audit Output */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Standard Baseline
                </span>
                <div className="my-2">
                  <span className="text-3xl font-black text-slate-700">
                    {formatNumber(baselineMonthly, 0)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 block">Litres / month</span>
                </div>
                <span className="text-[11px] text-slate-400">@ 135 LPCD standard</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Your Optimized Usage
                </span>
                <div className="my-2">
                  <span className="text-3xl font-black text-aqua-primary">
                    {formatNumber(actualMonthly, 0)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 block">Litres / month</span>
                </div>
                <span className="text-[11px] text-status-success font-semibold">
                  {savingsPercentage}% reduction
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Litres Conserved
                </span>
                <div className="my-2">
                  <span className="text-3xl font-black text-status-success">
                    {formatNumber(savedLitersMonthly, 0)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 block">Litres Saved</span>
                </div>
                <span className="text-[11px] text-status-success font-semibold">
                  Preserved for the society
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conservation Articles & Guidelines */}
        <div className="space-y-6">
          {CONSERVATION_GUIDELINES.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${group.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-navy-950">{group.category}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {group.tips.map((tip) => (
                    <div
                      key={tip.title}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-shadow flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-navy-950 leading-snug">{tip.title}</h3>
                        <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-status-success border border-emerald-200">
                          {tip.impact}
                        </div>
                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{tip.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center text-[11px] text-aqua-primary font-semibold">
                        <span>Actionable Standard</span>
                        <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

