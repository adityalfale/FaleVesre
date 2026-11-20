import fs from "fs";
import path from "path";
import {
  UserProfile,
  Community,
  Borewell,
  GroundwaterReading,
  WaterTank,
  TankerSchedule,
  HarvestingUnit,
  LeakageReport,
  CommunityWaterLog,
  SensorDevice,
  AlertNotification,
  UserRole,
} from "@/types";

export interface DatabaseSchema {
  profiles: UserProfile[];
  communities: Community[];
  borewells: Borewell[];
  groundwaterReadings: GroundwaterReading[];
  waterTanks: WaterTank[];
  tankerSchedules: TankerSchedule[];
  harvestingUnits: HarvestingUnit[];
  leakageReports: LeakageReport[];
  communityLogs: CommunityWaterLog[];
  sensors: SensorDevice[];
  alerts: AlertNotification[];
  waterConsumption: {
    id: string;
    communityId: string;
    date: string;
    liters: number;
    type: "domestic" | "gardening" | "commercial" | "loss";
  }[];
  rainfallReadings: {
    id: string;
    communityId: string;
    date: string;
    rainfallMm: number;
  }[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "aquasense_db.json");

function getInitialDatabaseData(): DatabaseSchema {
  const defaultCommunity: Community = {
    id: "comm-01",
    name: "Green Valley Eco Enclave",
    code: "GV-BLR-01",
    address: "Survey 42, Varthur - Sarjapur Road",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560087",
    latitude: 12.9352,
    longitude: 77.7298,
    totalHouseholds: 380,
  };

  const secondaryCommunity: Community = {
    id: "comm-02",
    name: "Sunrise Heights Cooperative",
    code: "SH-PUN-02",
    address: "Bavdhan Hills, West Pune",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411021",
    latitude: 18.5158,
    longitude: 73.7819,
    totalHouseholds: 240,
  };

  const initialProfiles: UserProfile[] = [
    {
      id: "usr-01",
      email: "admin@aquasense.ai",
      fullName: "Dr. Radhika Sharma",
      role: "super_admin",
      phone: "+91 98765 43210",
      communityId: "comm-01",
      communityName: "Green Valley Eco Enclave",
    },
    {
      id: "usr-02",
      email: "secretary@greenvalleys.org",
      fullName: "Suresh Menon",
      role: "society_admin",
      phone: "+91 98450 12345",
      communityId: "comm-01",
      communityName: "Green Valley Eco Enclave",
    },
    {
      id: "usr-03",
      email: "inspector@bwssb.gov.in",
      fullName: "Vikram Patel",
      role: "water_authority",
      phone: "+91 94480 67890",
      communityId: "comm-01",
      communityName: "Green Valley Eco Enclave",
    },
    {
      id: "usr-04",
      email: "resident.anita@gmail.com",
      fullName: "Anita Desai",
      role: "resident",
      phone: "+91 99123 45678",
      communityId: "comm-01",
      communityName: "Green Valley Eco Enclave",
    },
  ];

  const initialBorewells: Borewell[] = [
    {
      id: "bw-001",
      communityId: "comm-01",
      name: "Main Deep Borewell #1 (North Gate)",
      code: "BW-GV-01",
      totalDepthMeters: 185,
      casingDepthMeters: 32,
      pumpInstalledDepthMeters: 150,
      pumpPowerHp: 7.5,
      pumpFlowRateLpm: 75,
      status: "active",
      currentDepthToWaterMeters: 14.8, // Depth to water measured downwards from ground level
      currentWaterColumnMeters: 135.2, // Total depth (185) minus 14.8 minus 35m pump sum
      installationDate: "2021-03-15",
      lastUpdated: new Date().toISOString(),
      source: "sensor",
    },
    {
      id: "bw-002",
      communityId: "comm-01",
      name: "Secondary Recharge Borewell #2 (South Park)",
      code: "BW-GV-02",
      totalDepthMeters: 140,
      casingDepthMeters: 28,
      pumpInstalledDepthMeters: 110,
      pumpPowerHp: 5.0,
      pumpFlowRateLpm: 50,
      status: "active",
      currentDepthToWaterMeters: 16.2,
      currentWaterColumnMeters: 93.8,
      installationDate: "2022-07-20",
      lastUpdated: new Date().toISOString(),
      source: "manual_verified",
    },
    {
      id: "bw-003",
      communityId: "comm-02",
      name: "Bavdhan Hill Recharge Borewell #1",
      code: "BW-SH-01",
      totalDepthMeters: 160,
      casingDepthMeters: 30,
      pumpInstalledDepthMeters: 130,
      pumpPowerHp: 6.0,
      pumpFlowRateLpm: 60,
      status: "maintenance",
      currentDepthToWaterMeters: 22.4,
      currentWaterColumnMeters: 107.6,
      installationDate: "2020-11-10",
      lastUpdated: new Date().toISOString(),
      source: "sensor",
    },
  ];

  // Generate 30 days of realistic groundwater readings
  const initialReadings: GroundwaterReading[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  for (let i = 0; i <= 30; i++) {
    const readingDate = new Date(baseDate);
    readingDate.setDate(readingDate.getDate() + i);
    // Slight seasonal variation: depth gradually increases from 13.9m to 14.8m
    const dailyVariation = Math.sin(i / 5) * 0.15;
    const depth = Number((13.9 + (i * 0.03) + dailyVariation).toFixed(2));
    initialReadings.push({
      id: `gw-read-${i + 1}`,
      borewellId: "bw-001",
      depthToWaterMeters: depth,
      waterColumnMeters: Number((185 - depth).toFixed(2)),
      temperatureCelsius: Number((23.5 + Math.cos(i) * 0.8).toFixed(1)),
      source: i === 30 ? "sensor" : i % 7 === 0 ? "manual_verified" : "sensor",
      measuredAt: readingDate.toISOString(),
      notes: i === 30 ? "Real-time telemetry sample" : undefined,
    });
  }

  const initialTanks: WaterTank[] = [
    {
      id: "tank-001",
      communityId: "comm-01",
      name: "Overhead Reservoir Tower A & B",
      tankType: "overhead",
      capacityLiters: 150000,
      heightMeters: 4.5,
      currentLevelLiters: 112500,
      currentPercentage: 75,
      status: "optimal",
      lastUpdated: new Date().toISOString(),
      sensorId: "sens-002",
    },
    {
      id: "tank-002",
      communityId: "comm-01",
      name: "Central Underground Raw Sump",
      tankType: "underground_sump",
      capacityLiters: 250000,
      heightMeters: 5.2,
      currentLevelLiters: 165000,
      currentPercentage: 66,
      status: "optimal",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "tank-003",
      communityId: "comm-01",
      name: "Rainwater Buffer Storage Sump",
      tankType: "ground_level",
      capacityLiters: 80000,
      heightMeters: 3.5,
      currentLevelLiters: 28000,
      currentPercentage: 35,
      status: "moderate",
      lastUpdated: new Date().toISOString(),
    },
  ];

  const initialTankerSchedules: TankerSchedule[] = [
    {
      id: "tnk-sch-01",
      communityId: "comm-01",
      vendorName: "Cauvery Aqua Logistics",
      driverName: "Mahesh Kumar",
      driverPhone: "+91 97412 88451",
      vehicleNumber: "KA-01-MJ-4512",
      capacityLiters: 12000,
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "10:30 AM",
      status: "arrived",
      actualArrivalTime: new Date().toISOString(),
      targetTankId: "tank-002",
      notes: "Gate pass #892 issued. Water TDS 240 ppm verified.",
    },
    {
      id: "tnk-sch-02",
      communityId: "comm-01",
      vendorName: "Sarjapur Clean Water Express",
      driverName: "Pradeep Rao",
      driverPhone: "+91 98860 33190",
      vehicleNumber: "KA-53-B-7820",
      capacityLiters: 12000,
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      scheduledTime: "04:00 PM",
      status: "scheduled",
      targetTankId: "tank-001",
      notes: "Scheduled replenishment for weekend evening demand.",
    },
    {
      id: "tnk-sch-03",
      communityId: "comm-01",
      vendorName: "AquaPure Water Carriers",
      driverName: "Sunil Gowda",
      driverPhone: "+91 99001 22849",
      vehicleNumber: "KA-05-AB-3921",
      capacityLiters: 15000,
      scheduledDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      scheduledTime: "11:00 AM",
      status: "completed",
      actualArrivalTime: new Date(Date.now() - 86400000).toISOString(),
      targetTankId: "tank-002",
      notes: "Delivered 15,000L. Payment voucher #1043 approved.",
    },
  ];

  const initialHarvestingUnits: HarvestingUnit[] = [
    {
      id: "rwh-01",
      communityId: "comm-01",
      buildingName: "Clubhouse & Tower A Catchment",
      catchmentAreaSqm: 1450,
      harvestingMethod: "hybrid",
      storageCapacityLiters: 120000,
      runoffCoefficient: 0.88,
      installationDate: "2021-08-10",
      filterType: "Dual Sand-Gravel & Leaf Screen Pre-Filter",
    },
    {
      id: "rwh-02",
      communityId: "comm-01",
      buildingName: "Tower B & Parking Deck Rooftop",
      catchmentAreaSqm: 2100,
      harvestingMethod: "groundwater_recharge_pit",
      storageCapacityLiters: 80000,
      runoffCoefficient: 0.85,
      installationDate: "2022-04-18",
      filterType: "Percolation Recharge Well with Geo-textile Membrane",
    },
  ];

  const initialLeakageReports: LeakageReport[] = [
    {
      id: "leak-01",
      communityId: "comm-01",
      reportedBy: "usr-04",
      reporterName: "Anita Desai (Tower B - 402)",
      title: "Main Garden Irrigation Valve Weeping",
      description: "Water continuously pooling near the children's park sprinkler junction valve. Estimated 15-20 litres lost every hour.",
      leakageType: "valve_leak",
      severity: "medium",
      latitude: 12.9351,
      longitude: 77.7296,
      locationDescription: "North garden corner near bench 4",
      photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=600&q=80",
      status: "in_progress",
      estimatedWaterLossLiters: 240,
      assignedTo: "Murali (Plumbing Staff)",
      resolutionNotes: "Replacement valve seal dispatched. Expected completion today 5 PM.",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "leak-02",
      communityId: "comm-01",
      reporterName: "Security Gate Team",
      title: "Underground Sump Overflow Sensor Failure",
      description: "Overflow pipe was trickling water into storm drain for 40 minutes during morning pump fill cycle.",
      leakageType: "overhead_tank_overflow",
      severity: "high",
      latitude: 12.9354,
      longitude: 77.7301,
      locationDescription: "Central Sump Room #2",
      status: "resolved",
      estimatedWaterLossLiters: 650,
      assignedTo: "Apex Automation Engineers",
      resolutionNotes: "Float switch recalibrated and auto-shutoff relay replaced.",
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  const initialCommunityLogs: CommunityWaterLog[] = [
    {
      id: "log-01",
      communityId: "comm-01",
      authorName: "Society Management Office",
      logType: "water_availability",
      title: "Daily Water Supply Schedule - Uninterrupted 24/7",
      content: "Both overhead reservoirs are currently operating above 75% capacity. Water pressure remains nominal across all blocks.",
      metricValue: 75,
      metricUnit: "%",
      isVerified: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "log-02",
      communityId: "comm-01",
      authorName: "Anita Desai (Resident)",
      logType: "conservation_observation",
      title: "Aerator Installation Feedback - Tower B",
      content: "All 48 apartments in Tower B have completed installation of 3 LPM water-saving faucet aerators, saving an estimated 14,000L weekly.",
      isVerified: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "log-03",
      communityId: "comm-01",
      authorName: "Karthik Subramanian (Tower C)",
      logType: "shortage_alert",
      title: "Notice: Low Pressure on 8th Floor between 2 PM - 4 PM",
      content: "Observed slightly reduced pressure during booster pump maintenance window. Resolved after booster switchover.",
      isVerified: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const initialSensors: SensorDevice[] = [
    {
      id: "sens-001",
      deviceUid: "ESP32-BW01-D9F4",
      deviceType: "pressure_transducer",
      borewellId: "bw-001",
      locationName: "Main Deep Borewell #1",
      hardwareModel: "ESP32-AquaSense-Pro (Hydrostatic Submersible Transducer)",
      firmwareVersion: "v2.4.1",
      connectionProtocol: "wifi_http",
      apiToken: "sec_tok_bw01_9921ab",
      status: "online",
      batteryPercentage: 98,
      signalStrengthRssi: -62,
      lastPingAt: new Date().toISOString(),
    },
    {
      id: "sens-002",
      deviceUid: "ESP32-TANK-A102",
      deviceType: "ultrasonic_depth",
      locationName: "Tower A Overhead Tank",
      hardwareModel: "ESP32-AquaSense-Tank (Ultrasonic Transceiver IP68)",
      firmwareVersion: "v2.3.8",
      connectionProtocol: "wifi_http",
      apiToken: "sec_tok_tnk01_7734cd",
      status: "online",
      batteryPercentage: 94,
      signalStrengthRssi: -58,
      lastPingAt: new Date().toISOString(),
    },
    {
      id: "sens-003",
      deviceUid: "ESP32-RAIN-R701",
      deviceType: "rain_gauge",
      locationName: "Clubhouse Weather Station",
      hardwareModel: "ESP32-AquaSense-Meteo (Tipping Bucket Rain Gauge)",
      firmwareVersion: "v1.9.0",
      connectionProtocol: "lorawan",
      apiToken: "sec_tok_rain_4482ef",
      status: "online",
      batteryPercentage: 88,
      signalStrengthRssi: -74,
      lastPingAt: new Date().toISOString(),
    },
    {
      id: "sens-004",
      deviceUid: "ESP32-FLOW-F305",
      deviceType: "flow_meter",
      locationName: "Main Distribution Manifold",
      hardwareModel: "ESP32-AquaSense-Flow (Electromagnetic Digital Flowmeter)",
      firmwareVersion: "v2.1.0",
      connectionProtocol: "wifi_http",
      apiToken: "sec_tok_flow_8819ab",
      status: "online",
      batteryPercentage: 100,
      signalStrengthRssi: -54,
      lastPingAt: new Date().toISOString(),
    },
  ];

  const initialAlerts: AlertNotification[] = [
    {
      id: "alt-01",
      communityId: "comm-01",
      title: "Groundwater Table Declining Seasonally",
      message: "Depth to water in North Borewell #1 increased by 0.9m over the last 30 days. Pumping rate optimization recommended.",
      severity: "warning",
      category: "groundwater",
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "alt-02",
      communityId: "comm-01",
      title: "Tanker Supply Successfully Delivered",
      message: "Cauvery Aqua Logistics delivered 12,000L to Central Underground Sump at 10:30 AM.",
      severity: "info",
      category: "tanker",
      isRead: false,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: "alt-03",
      communityId: "comm-01",
      title: "High Water Loss Reported Near Garden Valve",
      message: "New leakage report submitted by resident Anita Desai. Maintenance dispatched.",
      severity: "warning",
      category: "leakage",
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  // Water consumption history (past 14 days)
  const initialConsumption = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseUsage = isWeekend ? 68000 : 54000;
    const variation = Math.sin(i) * 3500;
    initialConsumption.push({
      id: `cons-${i}`,
      communityId: "comm-01",
      date: dayStr,
      liters: Math.round(baseUsage + variation),
      type: "domestic" as const,
    });
  }

  // Rainfall history (past 30 days)
  const initialRainfall = [
    { id: "rain-1", communityId: "comm-01", date: "2026-10-25", rainfallMm: 24.5 },
    { id: "rain-2", communityId: "comm-01", date: "2026-10-28", rainfallMm: 42.0 },
    { id: "rain-3", communityId: "comm-01", date: "2026-11-04", rainfallMm: 12.8 },
    { id: "rain-4", communityId: "comm-01", date: "2026-11-12", rainfallMm: 18.2 },
    { id: "rain-5", communityId: "comm-01", date: "2026-11-18", rainfallMm: 6.4 },
  ];

  return {
    profiles: initialProfiles,
    communities: [defaultCommunity, secondaryCommunity],
    borewells: initialBorewells,
    groundwaterReadings: initialReadings,
    waterTanks: initialTanks,
    tankerSchedules: initialTankerSchedules,
    harvestingUnits: initialHarvestingUnits,
    leakageReports: initialLeakageReports,
    communityLogs: initialCommunityLogs,
    sensors: initialSensors,
    alerts: initialAlerts,
    waterConsumption: initialConsumption,
    rainfallReadings: initialRainfall,
  };
}

// In-memory cache + persistent disk synchronization
let memoryCache: DatabaseSchema | null = null;

function ensureDataDirectory(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function getDatabase(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      memoryCache = JSON.parse(content) as DatabaseSchema;
      return memoryCache;
    } catch (err) {
      console.error("Failed to parse existing database file, rebuilding with seed data:", err);
    }
  }

  const initial = getInitialDatabaseData();
  saveDatabase(initial);
  memoryCache = initial;
  return memoryCache;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  memoryCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database file:", err);
  }
}

// Entity helper methods
export const db = {
  // Profiles & Auth
  getProfiles: () => getDatabase().profiles,
  getProfileByEmail: (email: string) => getDatabase().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()),
  getProfileById: (id: string) => getDatabase().profiles.find((p) => p.id === id),
  updateProfileRole: (id: string, role: UserRole) => {
    const data = getDatabase();
    const profile = data.profiles.find((p) => p.id === id);
    if (profile) {
      profile.role = role;
      saveDatabase(data);
    }
    return profile;
  },

  // Communities
  getCommunities: () => getDatabase().communities,
  getCommunityById: (id: string) => getDatabase().communities.find((c) => c.id === id),

  // Borewells
  getBorewells: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.borewells.filter((b) => b.communityId === communityId) : data.borewells;
  },
  getBorewellById: (id: string) => getDatabase().borewells.find((b) => b.id === id),
  addBorewell: (borewell: Omit<Borewell, "id" | "lastUpdated">) => {
    const data = getDatabase();
    const newBw: Borewell = {
      ...borewell,
      id: `bw-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    data.borewells.push(newBw);
    saveDatabase(data);
    return newBw;
  },
  updateBorewellReading: (id: string, depthToWater: number, source: Borewell["source"] = "sensor") => {
    const data = getDatabase();
    const bw = data.borewells.find((b) => b.id === id);
    if (bw) {
      bw.currentDepthToWaterMeters = depthToWater;
      bw.currentWaterColumnMeters = Number(Math.max(0, bw.totalDepthMeters - depthToWater).toFixed(2));
      bw.lastUpdated = new Date().toISOString();
      bw.source = source;

      // Add to historical readings
      data.groundwaterReadings.push({
        id: `gw-read-${Date.now()}`,
        borewellId: id,
        depthToWaterMeters: depthToWater,
        waterColumnMeters: bw.currentWaterColumnMeters,
        source,
        measuredAt: new Date().toISOString(),
      });

      saveDatabase(data);
    }
    return bw;
  },

  // Groundwater Readings
  getGroundwaterReadings: (borewellId: string) => {
    const data = getDatabase();
    return data.groundwaterReadings
      .filter((r) => r.borewellId === borewellId)
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
  },
  addGroundwaterReading: (reading: Omit<GroundwaterReading, "id">) => {
    const data = getDatabase();
    const newReading: GroundwaterReading = {
      ...reading,
      id: `gw-read-${Date.now()}`,
    };
    data.groundwaterReadings.push(newReading);

    // Also update parent borewell
    const bw = data.borewells.find((b) => b.id === reading.borewellId);
    if (bw) {
      bw.currentDepthToWaterMeters = reading.depthToWaterMeters;
      bw.currentWaterColumnMeters = reading.waterColumnMeters;
      bw.lastUpdated = reading.measuredAt;
      bw.source = reading.source;
    }

    saveDatabase(data);
    return newReading;
  },

  // Water Tanks
  getWaterTanks: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.waterTanks.filter((t) => t.communityId === communityId) : data.waterTanks;
  },
  addWaterTank: (tank: Omit<WaterTank, "id" | "lastUpdated">) => {
    const data = getDatabase();
    const newTank: WaterTank = {
      ...tank,
      id: `tank-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    data.waterTanks.push(newTank);
    saveDatabase(data);
    return newTank;
  },
  updateTankLevel: (id: string, currentLevelLiters: number) => {
    const data = getDatabase();
    const tank = data.waterTanks.find((t) => t.id === id);
    if (tank) {
      tank.currentLevelLiters = Math.max(0, Math.min(tank.capacityLiters, currentLevelLiters));
      tank.currentPercentage = Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100);
      tank.lastUpdated = new Date().toISOString();
      if (tank.currentPercentage < 25) {
        tank.status = "critical";
      } else if (tank.currentPercentage < 50) {
        tank.status = "low";
      } else if (tank.currentPercentage < 75) {
        tank.status = "moderate";
      } else {
        tank.status = "optimal";
      }
      saveDatabase(data);
    }
    return tank;
  },

  // Tanker Schedules
  getTankerSchedules: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.tankerSchedules.filter((s) => s.communityId === communityId) : data.tankerSchedules;
  },
  addTankerSchedule: (schedule: Omit<TankerSchedule, "id">) => {
    const data = getDatabase();
    const newSchedule: TankerSchedule = {
      ...schedule,
      id: `tnk-sch-${Date.now()}`,
    };
    data.tankerSchedules.unshift(newSchedule);
    saveDatabase(data);
    return newSchedule;
  },
  updateTankerStatus: (id: string, status: TankerSchedule["status"], notes?: string) => {
    const data = getDatabase();
    const schedule = data.tankerSchedules.find((s) => s.id === id);
    if (schedule) {
      schedule.status = status;
      if (status === "arrived" || status === "completed") {
        schedule.actualArrivalTime = new Date().toISOString();
      }
      if (notes) {
        schedule.notes = notes;
      }
      saveDatabase(data);
    }
    return schedule;
  },

  // Harvesting Units
  getHarvestingUnits: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.harvestingUnits.filter((u) => u.communityId === communityId) : data.harvestingUnits;
  },
  addHarvestingUnit: (unit: Omit<HarvestingUnit, "id">) => {
    const data = getDatabase();
    const newUnit: HarvestingUnit = {
      ...unit,
      id: `rwh-${Date.now()}`,
    };
    data.harvestingUnits.push(newUnit);
    saveDatabase(data);
    return newUnit;
  },

  // Leakage Reports
  getLeakageReports: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.leakageReports.filter((r) => r.communityId === communityId) : data.leakageReports;
  },
  addLeakageReport: (report: Omit<LeakageReport, "id" | "createdAt" | "updatedAt">) => {
    const data = getDatabase();
    const newReport: LeakageReport = {
      ...report,
      id: `leak-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.leakageReports.unshift(newReport);

    // Trigger alert
    data.alerts.unshift({
      id: `alt-${Date.now()}`,
      communityId: report.communityId,
      title: `New Leakage Reported: ${report.title}`,
      message: `${report.description} (${report.leakageType}) at ${report.locationDescription}`,
      severity: report.severity === "critical" || report.severity === "high" ? "critical" : "warning",
      category: "leakage",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(data);
    return newReport;
  },
  updateLeakageStatus: (id: string, status: LeakageReport["status"], resolutionNotes?: string, assignedTo?: string) => {
    const data = getDatabase();
    const report = data.leakageReports.find((r) => r.id === id);
    if (report) {
      report.status = status;
      report.updatedAt = new Date().toISOString();
      if (resolutionNotes) report.resolutionNotes = resolutionNotes;
      if (assignedTo) report.assignedTo = assignedTo;
      saveDatabase(data);
    }
    return report;
  },

  // Community Logs
  getCommunityLogs: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.communityLogs.filter((l) => l.communityId === communityId) : data.communityLogs;
  },
  addCommunityLog: (log: Omit<CommunityWaterLog, "id" | "createdAt">) => {
    const data = getDatabase();
    const newLog: CommunityWaterLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    data.communityLogs.unshift(newLog);
    saveDatabase(data);
    return newLog;
  },
  verifyCommunityLog: (id: string) => {
    const data = getDatabase();
    const log = data.communityLogs.find((l) => l.id === id);
    if (log) {
      log.isVerified = true;
      saveDatabase(data);
    }
    return log;
  },

  // Sensors
  getSensors: () => getDatabase().sensors,
  registerSensor: (sensor: Omit<SensorDevice, "id" | "lastPingAt">) => {
    const data = getDatabase();
    const newSensor: SensorDevice = {
      ...sensor,
      id: `sens-${Date.now()}`,
      lastPingAt: new Date().toISOString(),
    };
    data.sensors.push(newSensor);
    saveDatabase(data);
    return newSensor;
  },
  recordSensorPing: (deviceUid: string, readingValue: number) => {
    const data = getDatabase();
    const sensor = data.sensors.find((s) => s.deviceUid === deviceUid);
    if (sensor) {
      sensor.lastPingAt = new Date().toISOString();
      sensor.status = "online";

      // If attached to a borewell, update borewell reading
      if (sensor.borewellId) {
        db.updateBorewellReading(sensor.borewellId, readingValue, "sensor");
      }

      saveDatabase(data);
    }
    return sensor;
  },

  // Alerts
  getAlerts: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.alerts.filter((a) => a.communityId === communityId) : data.alerts;
  },
  markAlertAsRead: (id: string) => {
    const data = getDatabase();
    const alert = data.alerts.find((a) => a.id === id);
    if (alert) {
      alert.isRead = true;
      saveDatabase(data);
    }
    return alert;
  },
  markAllAlertsAsRead: (communityId?: string) => {
    const data = getDatabase();
    data.alerts.forEach((a) => {
      if (!communityId || a.communityId === communityId) {
        a.isRead = true;
      }
    });
    saveDatabase(data);
  },

  // Water Consumption & Rainfall
  getWaterConsumption: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.waterConsumption.filter((c) => c.communityId === communityId) : data.waterConsumption;
  },
  getRainfallReadings: (communityId?: string) => {
    const data = getDatabase();
    return communityId ? data.rainfallReadings.filter((r) => r.communityId === communityId) : data.rainfallReadings;
  },
};

