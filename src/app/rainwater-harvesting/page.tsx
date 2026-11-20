"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  CloudRain,
  Calculator,
  CheckSquare,
  Square,
  Plus,
  Droplets,
  Layers,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { HarvestingUnit } from "@/types";

export default function RainwaterHarvestingPage() {
  const [units, setUnits] = useState<HarvestingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculator form states
  const [calcRoofArea, setCalcRoofArea] = useState<number>(1850);
  const [calcRainfall, setCalcRainfall] = useState<number>(850);
  const [calcCoeff, setCalcCoeff] = useState<number>(0.85);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Maintenance checklist state
  const [checklist, setChecklist] = useState({
    rooftopCleaned: true,
    filtersInspected: true,
    downpipesChecked: false,
    storageTankCleaned: true,
    rechargePitCleared: true,
    overflowTested: false,
  });

  // Unit registration state
  const [newBuilding, setNewBuilding] = useState("");
  const [newArea, setNewArea] = useState("1200");
  const [newMethod, setNewMethod] = useState<HarvestingUnit["harvestingMethod"]>("hybrid");
  const [newCapacity, setNewCapacity] = useState("80000");

  const fetchUnits = async () => {
    try {
      const res = await fetch("/api/rainwater?communityId=comm-01");
      const data = await res.json();
      setUnits(data);
    } catch (err) {
      console.error("Failed to load RWH units:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateHarvesting = async (area: number, rain: number, coeff: number) => {
    try {
      const res = await fetch("/api/rainwater", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "calculate",
          roofAreaSqm: area,
          rainfallMm: rain,
          runoffCoefficient: coeff,
        }),
      });
      const data = await res.json();
      setCalcResult(data);
    } catch (err) {
      console.error("Calculation failed:", err);
    }
  };

  useEffect(() => {
    fetchUnits();
    calculateHarvesting(calcRoofArea, calcRainfall, calcCoeff);
  }, []);

  const handleRegisterUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuilding || !newArea) return;

    try {
      const res = await fetch("/api/rainwater", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingName: newBuilding,
          catchmentAreaSqm: Number(newArea),
          harvestingMethod: newMethod,
          storageCapacityLiters: Number(newCapacity),
          runoffCoefficient: 0.85,
        }),
      });

      if (res.ok) {
        await fetchUnits();
        setShowAddModal(false);
        setNewBuilding("");
      }
    } catch (err) {
      console.error("Failed to add unit:", err);
    }
  };

  const completedChecks = Object.values(checklist).filter(Boolean).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <CloudRain className="w-6 h-6 text-aqua-primary" />
              Rainwater Harvesting & Aquifer Recharge
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Catchment effectiveness calculator, percolation pit monitoring, and seasonal maintenance checklist.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5 text-aqua-cyan" />
            <span>Register Harvesting Unit</span>
          </button>
        </div>

        {/* Section 1: Scientific Effectiveness Calculator */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-aqua-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">
                Hydrological Harvestable Yield Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Scientifically calculated: Harvestable Volume (L) = Catchment Area (m²) × Rainfall (mm) × Runoff Coefficient.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-navy-900 flex justify-between mb-1">
                  <span>Catchment Rooftop Area</span>
                  <span className="text-aqua-primary">{calcRoofArea} m²</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={calcRoofArea}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCalcRoofArea(val);
                    calculateHarvesting(val, calcRainfall, calcCoeff);
                  }}
                  className="w-full accent-aqua-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>200 m² (Villa)</span>
                  <span>5,000 m² (Commercial/Tower)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-900 flex justify-between mb-1">
                  <span>Annual / Storm Rainfall</span>
                  <span className="text-aqua-primary">{calcRainfall} mm</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="25"
                  value={calcRainfall}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCalcRainfall(val);
                    calculateHarvesting(calcRoofArea, val, calcCoeff);
                  }}
                  className="w-full accent-aqua-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>100 mm (Single storm)</span>
                  <span>2,000 mm (Monsoon belt)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-900 flex justify-between mb-1">
                  <span>Roof Runoff Efficiency Factor</span>
                  <span className="text-aqua-primary">{calcCoeff}</span>
                </label>
                <select
                  value={calcCoeff}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCalcCoeff(val);
                    calculateHarvesting(calcRoofArea, calcRainfall, val);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary bg-slate-50"
                >
                  <option value={0.88}>Smooth RCC Concrete Slab (0.85 - 0.90)</option>
                  <option value={0.92}>Corrugated Metal / Tin Sheeting (0.90 - 0.95)</option>
                  <option value={0.75}>Clay Tile / Terracotta Shingles (0.75 - 0.80)</option>
                  <option value={0.65}>Paved Permeable Interlock Pavers (0.60 - 0.70)</option>
                </select>
              </div>
            </div>

            {/* Output Calculation Cards */}
            {calcResult && (
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Harvestable Water
                  </span>
                  <div className="my-2">
                    <span className="text-3xl font-black text-navy-950">
                      {formatNumber(calcResult.harvestableLiters, 0)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 block">Litres</span>
                  </div>
                  <span className="text-xs font-semibold text-aqua-primary">
                    = {calcResult.harvestableKiloliters} kiloLitres (kL)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Deep Aquifer Recharge
                  </span>
                  <div className="my-2">
                    <span className="text-3xl font-black text-status-success">
                      {formatNumber(calcResult.rechargePotentialLiters, 0)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 block">Litres Replenished</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    70% percolation via pit
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Community Water Security
                  </span>
                  <div className="my-2">
                    <span className="text-3xl font-black text-navy-950">
                      {calcResult.daysOfWaterSecurity}
                    </span>
                    <span className="text-xs font-bold text-slate-500 block">Full Supply Days</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    For 380 homes @ 135 LPCD
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Maintenance Checklist + Registered Units */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Checklist */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-navy-950">Pre-Monsoon Maintenance Checklist</h2>
                <p className="text-xs text-slate-500">Essential preventative upkeep for catchment efficiency.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-status-success border border-emerald-200">
                {completedChecks} / 6 Completed
              </span>
            </div>

            <div className="space-y-3">
              {[
                { key: "rooftopCleaned", label: "Clean rooftop collection surface from silt and dry debris" },
                { key: "filtersInspected", label: "Inspect and backwash sand-gravel dual-media filter mesh" },
                { key: "downpipesChecked", label: "Check downpipes, gutting flanges and leaf-screens for blockages" },
                { key: "storageTankCleaned", label: "Disinfect and flush underground rainwater holding sump" },
                { key: "rechargePitCleared", label: "Clear percolation pit boulder bed and check geo-membrane" },
                { key: "overflowTested", label: "Test emergency storm surge overflow bypass into recharge well" },
              ].map((item) => {
                const isChecked = (checklist as any)[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      setChecklist((prev) => ({
                        ...prev,
                        [item.key]: !isChecked,
                      }))
                    }
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${isChecked ? "text-navy-900 line-through opacity-80" : "text-slate-700"}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registered Harvesting Units */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-navy-950">Registered Harvesting Units</h2>
              <span className="text-xs font-semibold text-slate-500">{units.length} Units</span>
            </div>

            <div className="space-y-3">
              {units.map((unit) => (
                <div key={unit.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-navy-950 text-sm">{unit.buildingName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-status-success border border-emerald-200 uppercase">
                      {unit.harvestingMethod.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-slate-600">
                    <div>
                      <span>Catchment Area: </span>
                      <strong className="text-navy-900">{unit.catchmentAreaSqm} m²</strong>
                    </div>
                    <div>
                      <span>Storage Capacity: </span>
                      <strong className="text-navy-900">{formatNumber(unit.storageCapacityLiters, 0)} L</strong>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    Filter: {unit.filterType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Register Harvesting Unit */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Register Rainwater Harvesting Unit</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterUnit} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Building / Structure Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tower C & Recreation Center"
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Rooftop Catchment Area (m²)
                  </label>
                  <input
                    type="number"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Harvesting System Architecture
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="hybrid">Hybrid (Storage Sump + Recharge Pit)</option>
                    <option value="rooftop_storage">Direct Rooftop Cistern Storage</option>
                    <option value="groundwater_recharge_pit">Percolation Recharge Well</option>
                    <option value="filtration_well">Dual-Media Filtration Well</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Storage Capacity (Litres)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
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
                    className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors"
                  >
                    Register Unit
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

