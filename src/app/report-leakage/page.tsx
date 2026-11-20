"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Camera,
  X,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { formatNumber, formatDate, formatTime } from "@/lib/utils";
import { LeakageReport } from "@/types";

export default function ReportLeakagePage() {
  const [reports, setReports] = useState<LeakageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leakageType, setLeakageType] = useState<LeakageReport["leakageType"]>("pipe_burst");
  const [severity, setSeverity] = useState<LeakageReport["severity"]>("medium");
  const [locationDescription, setLocationDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [reporterName, setReporterName] = useState("Anita Desai (Tower B - 402)");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/leakage?communityId=comm-01");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to load leakage reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leakage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          leakageType,
          severity,
          locationDescription: locationDescription || "Society Premises",
          photoUrl: photoUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=600&q=80",
          reporterName,
          estimatedWaterLossLiters: severity === "critical" ? 500 : severity === "high" ? 250 : 50,
        }),
      });

      if (res.ok) {
        await fetchReports();
        setShowSubmitModal(false);
        setTitle("");
        setDescription("");
        setLocationDescription("");
      }
    } catch (err) {
      console.error("Failed to submit leakage report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: LeakageReport["status"],
    assignedTo?: string,
    notes?: string
  ) => {
    try {
      const res = await fetch("/api/leakage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, assignedTo, resolutionNotes: notes }),
      });
      if (res.ok) {
        await fetchReports();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-status-danger" />
              Community Water Leakage & Loss Reporting
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Report pipe bursts, tank overflows, valve leaks and track prompt resolution by maintenance staff.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-lg bg-status-danger hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Report Water Leakage</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
          {["all", "submitted", "under_review", "assigned", "in_progress", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? "bg-navy-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Informational Disclaimer Banner (Section 14 requirement) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-aqua-primary flex-shrink-0 mt-0.5" />
          <span>
            <strong>Resolution Policy:</strong> Internal community reports are routed directly to society facilities engineering teams. Reports are not dispatched to municipal statutory boards unless an authorized municipal API dispatch adapter is configured.
          </span>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {report.leakageType.replace("_", " ")}
                    </span>
                    <h3 className="text-base font-bold text-navy-950 mt-0.5">{report.title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      report.status === "resolved"
                        ? "bg-emerald-50 text-status-success border-emerald-200"
                        : report.status === "in_progress"
                        ? "bg-sky-50 text-aqua-primary border-sky-200"
                        : report.status === "assigned"
                        ? "bg-amber-50 text-status-warning border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {report.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2">{report.description}</p>

                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{report.locationDescription}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>Reported by: <strong className="text-slate-600">{report.reporterName}</strong></span>
                  <span>•</span>
                  <span>{formatDate(report.createdAt)}</span>
                </div>

                {report.assignedTo && (
                  <div className="mt-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-navy-900">
                    <span>Assigned Technician: <strong>{report.assignedTo}</strong></span>
                    {report.resolutionNotes && (
                      <p className="text-slate-600 text-[11px] mt-1">Status: {report.resolutionNotes}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Administrative Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Est. Loss: <strong className="text-status-danger">{report.estimatedWaterLossLiters} L</strong>
                </span>

                <div className="flex items-center gap-2">
                  {report.status === "submitted" && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, "assigned", "Ramesh (Chief Plumber)")}
                      className="px-3 py-1 rounded bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs"
                    >
                      Assign Technician
                    </button>
                  )}

                  {report.status === "assigned" && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, "in_progress")}
                      className="px-3 py-1 rounded bg-aqua-primary hover:bg-navy-800 text-white font-semibold text-xs"
                    >
                      Start Repair
                    </button>
                  )}

                  {report.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, "resolved", undefined, "Flange seal replaced and pressure tested.")}
                      className="px-3 py-1 rounded bg-status-success hover:bg-emerald-700 text-white font-semibold text-xs"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Report Leakage Form */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-status-danger" />
                  Report Water Leakage
                </h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Summary / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Irrigation Main Line Pooling Water"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Leakage Type
                    </label>
                    <select
                      value={leakageType}
                      onChange={(e) => setLeakageType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    >
                      <option value="pipe_burst">Pipe Burst / Crack</option>
                      <option value="overhead_tank_overflow">Overhead Tank Overflow</option>
                      <option value="valve_leak">Valve / Flange Leak</option>
                      <option value="meter_leak">Water Meter Leak</option>
                      <option value="ground_seepage">Ground Seepage</option>
                      <option value="faucet_drip">Common Area Faucet Drip</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    >
                      <option value="low">Low (Slow Drip)</option>
                      <option value="medium">Medium (Trickle / Pooling)</option>
                      <option value="high">High (Continuous Gush)</option>
                      <option value="critical">Critical (High Flow Flooding)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Location Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block B Basement Parking, Column 42"
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Detailed Observations
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the leak rate, visible pipe condition or water pooling..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-status-danger hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Leakage Report"}
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

