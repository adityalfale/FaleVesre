import { create } from "zustand";

export type UserRole = "resident" | "society_admin" | "water_authority" | "super_admin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  communityId: string;
  communityName: string;
}

export interface Community {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  totalHouseholds: number;
}

export interface Borewell {
  id: string;
  communityId: string;
  name: string;
  code: string;
  totalDepthMeters: number;
  casingDepthMeters: number;
  pumpInstalledDepthMeters: number;
  pumpPowerHp: number;
  pumpFlowRateLpm: number;
  status: "active" | "maintenance" | "depleted" | "inactive";
  currentDepthToWaterMeters: number;
  currentWaterColumnMeters: number;
  installationDate: string;
  lastUpdated: string;
  source: "sensor" | "manual_verified" | "community_unverified" | "ai_estimate";
}

export interface GroundwaterReading {
  id: string;
  borewellId: string;
  depthToWaterMeters: number; // Measured downwards from surface (higher = lower water table)
  waterColumnMeters: number;
  temperatureCelsius?: number;
  source: "sensor" | "manual_verified" | "community_unverified" | "ai_estimate";
  measuredAt: string;
  notes?: string;
}

export interface WaterTank {
  id: string;
  communityId: string;
  name: string;
  tankType: "overhead" | "underground_sump" | "ground_level";
  capacityLiters: number;
  heightMeters: number;
  currentLevelLiters: number;
  currentPercentage: number;
  status: "optimal" | "moderate" | "low" | "critical";
  lastUpdated: string;
  sensorId?: string;
}

export interface TankerSchedule {
  id: string;
  communityId: string;
  vendorName: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  capacityLiters: number;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "arrived" | "delayed" | "completed" | "cancelled";
  actualArrivalTime?: string;
  targetTankId?: string;
  notes?: string;
}

export interface HarvestingUnit {
  id: string;
  communityId: string;
  buildingName: string;
  catchmentAreaSqm: number;
  harvestingMethod: "rooftop_storage" | "groundwater_recharge_pit" | "filtration_well" | "hybrid";
  storageCapacityLiters: number;
  runoffCoefficient: number;
  installationDate: string;
  filterType: string;
}

export interface LeakageReport {
  id: string;
  communityId: string;
  reportedBy?: string;
  reporterName: string;
  title: string;
  description: string;
  leakageType: "pipe_burst" | "overhead_tank_overflow" | "valve_leak" | "meter_leak" | "ground_seepage" | "faucet_drip";
  severity: "low" | "medium" | "high" | "critical";
  latitude: number;
  longitude: number;
  locationDescription: string;
  photoUrl?: string;
  status: "submitted" | "under_review" | "assigned" | "in_progress" | "resolved" | "rejected";
  estimatedWaterLossLiters: number;
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityWaterLog {
  id: string;
  communityId: string;
  authorId?: string;
  authorName: string;
  logType: "water_availability" | "shortage_alert" | "tanker_arrival" | "manual_measurement" | "conservation_observation";
  title: string;
  content: string;
  metricValue?: number;
  metricUnit?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SensorDevice {
  id: string;
  deviceUid: string;
  deviceType: "ultrasonic_depth" | "flow_meter" | "pressure_transducer" | "rain_gauge" | "water_quality";
  borewellId?: string;
  locationName: string;
  hardwareModel: string;
  firmwareVersion: string;
  connectionProtocol: "wifi_http" | "mqtt" | "lorawan" | "cellular";
  apiToken: string;
  status: "online" | "offline" | "warning" | "maintenance";
  batteryPercentage: number;
  signalStrengthRssi: number;
  lastPingAt: string;
}

export interface AlertNotification {
  id: string;
  communityId: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  category: "groundwater" | "tank_level" | "consumption" | "leakage" | "device_offline" | "tanker" | "rainwater";
  isRead: boolean;
  createdAt: string;
}

