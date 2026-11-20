"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Truck,
  Plus,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  X,
  Filter,
} from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { TankerSchedule } from "@/types";

export default function TankerSchedulePage() {
  const [schedules, setSchedules] = useState<TankerSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMissedModal, setShowMissedModal] = useState(false);

  // Form states
  const [vendorName, setVendorName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [capacityLiters, setCapacityLiters] = useState("12000");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");
  const [notes, setNotes] = useState("");

  // Missed report state
  const [missedNotes, setMissedNotes] = useState("");

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/tankers?communityId=comm-01");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to load tanker schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleUpdateStatus = async (id: string, status: TankerSchedule["status"]) => {
    try {
      const res = await fetch("/api/tankers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await fetchSchedules();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vehicleNumber || !scheduledDate) return;

    try {
      const res = await fetch("/api/tankers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName,
          driverName,
          driverPhone,
          vehicleNumber,
          capacityLiters: Number(capacityLiters),
          scheduledDate,
          scheduledTime,
          status: "scheduled",
          notes,
        }),
      });

      if (res.ok) {
        await fetchSchedules();
        setShowAddModal(false);
        setVendorName("");
        setVehicleNumber("");
        setDriverName("");
        setDriverPhone("");
      }
    } catch (err) {
      console.error("Failed to add tanker schedule:", err);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6 text-aqua-primary" />
              Municipal & Private Tanker Supply Schedule
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Scheduled deliveries, arrival verifications, volume audit and resident delivery tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMissedModal(true)}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-status-danger text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Missed Delivery</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-aqua-cyan" />
              <span>Schedule Tanker Supply</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
          <div className="flex flex-wrap items-center gap-1.5">
            {["all", "scheduled", "arrived", "delayed", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterStatus === st
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white text-navy-900 shadow-xs" : "hover:text-navy-900"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === "calendar" ? "bg-white text-navy-900 shadow-xs" : "hover:text-navy-900"
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-navy-900 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-aqua-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Logistics Notice:</span> Tanker arrival timestamps are updated via society security gate pass validation. Live vehicle GPS telemetry is only active when partnered transport telemetry modules are provisioned.
          </div>
        </div>

        {/* Schedules Grid / List */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-aqua-primary flex-shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-navy-950">{schedule.vendorName}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          schedule.status === "completed"
                            ? "bg-emerald-50 text-status-success border-emerald-200"
                            : schedule.status === "arrived"
                            ? "bg-sky-50 text-aqua-primary border-sky-200"
                            : schedule.status === "delayed"
                            ? "bg-rose-50 text-status-danger border-rose-200"
                            : "bg-amber-50 text-status-warning border-amber-200"
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                        {schedule.vehicleNumber}
                      </span>
                      <span>Capacity: <strong className="text-navy-900">{formatNumber(schedule.capacityLiters, 0)} L</strong></span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {schedule.scheduledDate}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {schedule.scheduledTime}
                      </span>
                    </div>

                    {schedule.driverName && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>Driver: <strong className="text-slate-700">{schedule.driverName}</strong></span>
                        <a
                          href={`tel:${schedule.driverPhone}`}
                          className="text-aqua-primary hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {schedule.driverPhone}
                        </a>
                      </div>
                    )}

                    {schedule.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-md mt-2 max-w-xl">
                        📝 {schedule.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {schedule.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(schedule.id, "arrived")}
                        className="px-3 py-1.5 rounded-lg bg-aqua-primary hover:bg-navy-800 text-white text-xs font-semibold transition-colors"
                      >
                        Mark Arrived
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(schedule.id, "delayed")}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
                      >
                        Mark Delayed
                      </button>
                    </>
                  )}

                  {schedule.status === "arrived" && (
                    <button
                      onClick={() => handleUpdateStatus(schedule.id, "completed")}
                      className="px-3 py-1.5 rounded-lg bg-status-success hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                    >
                      Complete Delivery
                    </button>
                  )}

                  {schedule.status === "completed" && (
                    <span className="text-xs text-status-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Calendar Grid Representation */
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-navy-950">Upcoming Tanker Delivery Calendar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {schedules.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="text-xs font-bold text-navy-900">{formatDate(s.scheduledDate)}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.scheduledTime}</div>
                  <div className="mt-2 text-xs font-semibold text-navy-950 truncate">{s.vendorName}</div>
                  <div className="text-xs text-aqua-primary font-bold">{formatNumber(s.capacityLiters, 0)} L</div>
                  <span
                    className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add Tanker Schedule */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Schedule Tanker Delivery</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Vendor / Agency Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cauvery Pure Aqua Carriers"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Vehicle Plate Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KA-01-AB-1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Volume (Litres)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      required
                      value={capacityLiters}
                      onChange={(e) => setCapacityLiters(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Expected Time
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 11:30 AM"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Driver Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Driver Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
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
                    Save Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Report Missed Delivery */}
        {showMissedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-status-danger" />
                  Report Missed Delivery
                </h3>
                <button onClick={() => setShowMissedModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-4 text-xs">
                <p className="text-slate-600">
                  If an assigned municipal or private water tanker failed to arrive during its scheduled slot, submit an incident notice for society management to follow up with the vendor.
                </p>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Details & Delayed Duration
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Tanker KA-53-B-7820 was scheduled for 4 PM but has not arrived after 90 minutes."
                    value={missedNotes}
                    onChange={(e) => setMissedNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setShowMissedModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert("Missed delivery report submitted to Society Water Desk.");
                      setShowMissedModal(false);
                      setMissedNotes("");
                    }}
                    className="px-4 py-2 rounded-lg bg-status-danger hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
                  >
                    Submit Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

