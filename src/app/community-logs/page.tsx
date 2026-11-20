"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileText,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CommunityWaterLog } from "@/types";

export default function CommunityLogsPage() {
  const [logs, setLogs] = useState<CommunityWaterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [logType, setLogType] = useState<CommunityWaterLog["logType"]>("water_availability");
  const [metricValue, setMetricValue] = useState("");
  const [metricUnit, setMetricUnit] = useState("");
  const [authorName, setAuthorName] = useState("Anita Desai (Tower B)");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/community-logs?communityId=comm-01");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load community logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerifyLog = async (id: string) => {
    try {
      const res = await fetch("/api/community-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setLogs((prev) =>
          prev.map((l) => (l.id === id ? { ...l, isVerified: true } : l))
        );
      }
    } catch (err) {
      console.error("Failed to verify log:", err);
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const res = await fetch("/api/community-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          logType,
          authorName,
          metricValue: metricValue ? Number(metricValue) : undefined,
          metricUnit,
        }),
      });

      if (res.ok) {
        await fetchLogs();
        setShowAddModal(false);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      console.error("Failed to post community log:", err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "all" && log.logType !== filterType) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.content.toLowerCase().includes(q) ||
        log.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-aqua-primary" />
              Community Water Logs & Availability Diary
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Crowdsourced observations, pressure notifications, tanker verification, and resident conservation records.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5 text-aqua-cyan" />
            <span>Submit Water Observation</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search community posts, author, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-aqua-primary focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              "all",
              "water_availability",
              "shortage_alert",
              "tanker_arrival",
              "conservation_observation",
            ].map((tp) => (
              <button
                key={tp}
                onClick={() => setFilterType(tp)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterType === tp
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tp.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {log.logType.replace("_", " ")}
                  </span>
                  {log.isVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-status-success bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Unverified Resident Post
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-navy-950 mt-1">{log.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{log.content}</p>

                {log.metricValue !== undefined && (
                  <div className="mt-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 inline-flex items-center gap-2 text-xs">
                    <span className="text-slate-600">Reported Metric:</span>
                    <strong className="text-aqua-primary">
                      {log.metricValue} {log.metricUnit}
                    </strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium text-navy-900">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.authorName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span>{formatDate(log.createdAt)}</span>
                  {!log.isVerified && (
                    <button
                      onClick={() => handleVerifyLog(log.id)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-status-success font-semibold text-[11px] transition-colors"
                    >
                      Verify Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Log */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Submit Community Water Observation</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Title / Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Afternoon Water Pressure Normal in Block C"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Log Category
                  </label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="water_availability">Water Availability Update</option>
                    <option value="shortage_alert">Shortage / Low Pressure Notice</option>
                    <option value="tanker_arrival">Tanker Arrival Confirmation</option>
                    <option value="conservation_observation">Conservation Observation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Observation Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share observations about flow rate, supply hours, or conservation results..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Observed Metric (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy-900 block mb-1">
                      Unit (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. %, bar, Litres"
                      value={metricUnit}
                      onChange={(e) => setMetricUnit(e.target.value)}
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
                    Post to Community Board
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

