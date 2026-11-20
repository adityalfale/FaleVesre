"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Cpu,
  Plus,
  Radio,
  Wifi,
  Battery,
  ShieldCheck,
  RefreshCw,
  Send,
  Key,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { SensorDevice } from "@/types";

export default function DevicesPage() {
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Hardware Telemetry Ingestion Simulator state
  const [simSelectedUid, setSimSelectedUid] = useState<string>("");
  const [simToken, setSimToken] = useState<string>("");
  const [simReadingValue, setSimReadingValue] = useState<string>("15.2");
  const [simResponse, setSimResponse] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  // New device form state
  const [newUid, setNewUid] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState<SensorDevice["deviceType"]>("pressure_transducer");
  const [newProtocol, setNewProtocol] = useState<SensorDevice["connectionProtocol"]>("wifi_http");

  const fetchSensors = async () => {
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      setSensors(data);
      if (data.length > 0 && !simSelectedUid) {
        setSimSelectedUid(data[0].deviceUid);
        setSimToken(data[0].apiToken);
      }
    } catch (err) {
      console.error("Failed to load sensors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const handleSelectSimDevice = (uid: string) => {
    setSimSelectedUid(uid);
    const found = sensors.find((s) => s.deviceUid === uid);
    if (found) {
      setSimToken(found.apiToken);
    }
  };

  const handleSendSimulatorTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simSelectedUid || !simToken) return;

    setSimulating(true);
    setSimResponse(null);
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "telemetry_ingest",
          deviceUid: simSelectedUid,
          apiToken: simToken,
          readingValue: Number(simReadingValue),
        }),
      });
      const data = await res.json();
      setSimResponse(data);
      if (res.ok) {
        await fetchSensors();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceUid: newUid || undefined,
          deviceType: newType,
          locationName: newLocation || "Monitored Station",
          connectionProtocol: newProtocol,
        }),
      });

      if (res.ok) {
        await fetchSensors();
        setShowAddModal(false);
        setNewUid("");
        setNewLocation("");
      }
    } catch (err) {
      console.error("Failed to register sensor:", err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-aqua-primary" />
              ESP32 & IoT Sensor Infrastructure Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Secure hardware telemetry ingestion, token-authenticated gateways, signal strength, and health diagnostics.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5 text-aqua-cyan" />
            <span>Register ESP32 Node</span>
          </button>
        </div>

        {/* Live Registered Sensors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {sensor.deviceType.replace("_", " ")}
                    </span>
                    <h3 className="text-sm font-bold text-navy-950 mt-0.5">{sensor.locationName}</h3>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-status-success border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping"></span>
                    Online
                  </span>
                </div>

                <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-700 truncate">
                  UID: {sensor.deviceUid}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Hardware:</span>
                    <strong className="text-navy-900 truncate max-w-[140px]">{sensor.hardwareModel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Firmware:</span>
                    <span className="font-semibold text-slate-700">{sensor.firmwareVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="uppercase font-semibold text-aqua-primary">{sensor.connectionProtocol}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-status-success">
                  <Battery className="w-3.5 h-3.5" />
                  <span>{sensor.batteryPercentage}%</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{sensor.signalStrengthRssi} dBm</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hardware Ingestion Simulator Box */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-aqua-primary">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">
                ESP32 Hardware Ingestion Simulator & API Verification
              </h2>
              <p className="text-xs text-slate-500">
                Test the production sensor ingestion endpoint (<code className="bg-slate-100 px-1 py-0.5 rounded text-navy-900">POST /api/devices</code>) with bearer device tokens.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendSimulatorTelemetry} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">
                Target Sensor Node
              </label>
              <select
                value={simSelectedUid}
                onChange={(e) => handleSelectSimDevice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary bg-slate-50"
              >
                {sensors.map((s) => (
                  <option key={s.id} value={s.deviceUid}>
                    {s.locationName} ({s.deviceUid})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">
                Hardware Auth Token
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={simToken}
                  onChange={(e) => setSimToken(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">
                Simulated Reading Value
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={simReadingValue}
                onChange={(e) => setSimReadingValue(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary bg-slate-50"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={simulating}
                className="w-full py-2.5 px-4 rounded-lg bg-aqua-primary hover:bg-navy-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{simulating ? "Transmitting..." : "Send Telemetry Ping"}</span>
              </button>
            </div>
          </form>

          {/* Simulator Response Banner */}
          {simResponse && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                simResponse.status === "acknowledged"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {simResponse.status === "acknowledged" ? (
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-status-danger" />
                )}
                <span>Server Telemetry Acknowledgement: {simResponse.status || "Error"}</span>
              </div>
              <pre className="mt-1.5 text-[11px] font-mono bg-white/70 p-2 rounded border border-slate-200/60 overflow-x-auto">
                {JSON.stringify(simResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal: Register Sensor */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-navy-950">Register ESP32 Sensor Node</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-navy-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterDevice} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Device UID (Leave blank for auto-generate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ESP32-BW03-49A1"
                    value={newUid}
                    onChange={(e) => setNewUid(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Installation Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Boundary Recharge Pit Sump"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Sensor Transducer Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="pressure_transducer">Hydrostatic Pressure Transducer (Borewell Depth)</option>
                    <option value="ultrasonic_depth">Ultrasonic Transceiver (Tank Level)</option>
                    <option value="flow_meter">Digital Electromagnetic Flow Meter</option>
                    <option value="rain_gauge">Tipping Bucket Rain Gauge</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900 block mb-1">
                    Connectivity Protocol
                  </label>
                  <select
                    value={newProtocol}
                    onChange={(e) => setNewProtocol(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-aqua-primary"
                  >
                    <option value="wifi_http">Wi-Fi HTTP / HTTPS REST</option>
                    <option value="mqtt">MQTT Telemetry Broker</option>
                    <option value="lorawan">LoRaWAN Long-Range 868MHz</option>
                    <option value="cellular">4G / NB-IoT Cellular</option>
                  </select>
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
                    Register Node
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

