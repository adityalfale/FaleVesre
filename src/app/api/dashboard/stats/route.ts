import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || "comm-01";

  const borewells = db.getBorewells(communityId);
  const tanks = db.getWaterTanks(communityId);
  const consumption = db.getWaterConsumption(communityId);
  const rainfall = db.getRainfallReadings(communityId);
  const alerts = db.getAlerts(communityId);
  const communityLogs = db.getCommunityLogs(communityId);
  const leakage = db.getLeakageReports(communityId);

  // Calculate metrics
  const activeBorewells = borewells.filter((b) => b.status === "active");
  const currentDepth = borewells[0]?.currentDepthToWaterMeters || 14.8;
  const avgDepth = borewells.length > 0
    ? Number((borewells.reduce((acc, b) => acc + b.currentDepthToWaterMeters, 0) / borewells.length).toFixed(2))
    : currentDepth;

  // Tank availability
  const totalCapacity = tanks.reduce((acc, t) => acc + t.capacityLiters, 0);
  const currentLevel = tanks.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const tankPercentage = totalCapacity > 0 ? Math.round((currentLevel / totalCapacity) * 100) : 0;

  // Today's consumption (latest entry)
  const todayConsumption = consumption[consumption.length - 1]?.liters || 58000;
  const prevDayConsumption = consumption[consumption.length - 2]?.liters || 55000;
  const consumptionTrend = Number((((todayConsumption - prevDayConsumption) / prevDayConsumption) * 100).toFixed(1));

  // Rainfall total in past 30 days
  const totalRainfall = Number(rainfall.reduce((acc, r) => acc + r.rainfallMm, 0).toFixed(1));

  // Groundwater historical trend for primary borewell
  const primaryReadings = db.getGroundwaterReadings(borewells[0]?.id || "bw-001");
  const chartData = primaryReadings.slice(-14).map((r) => ({
    date: r.measuredAt.split("T")[0].slice(5),
    depthToWater: r.depthToWaterMeters,
    waterColumn: r.waterColumnMeters,
  }));

  // Consumption chart (past 7 days)
  const consumptionChart = consumption.slice(-7).map((c) => ({
    date: c.date.slice(5),
    liters: c.liters,
  }));

  return NextResponse.json({
    metrics: {
      currentGroundwaterDepth: {
        value: currentDepth,
        unit: "m",
        trend: "+0.3m (past 7 days)",
        trendDirection: "down", // declining water table (increasing depth)
        status: currentDepth > 30 ? "critical" : currentDepth > 20 ? "warning" : "normal",
        lastUpdated: borewells[0]?.lastUpdated || new Date().toISOString(),
        isSimulated: borewells[0]?.source === "ai_estimate",
        source: borewells[0]?.source || "sensor",
      },
      averageGroundwaterDepth: {
        value: avgDepth,
        unit: "m",
        activeCount: activeBorewells.length,
        totalCount: borewells.length,
      },
      activeBorewells: {
        value: activeBorewells.length,
        total: borewells.length,
        status: "operational",
      },
      tankAvailability: {
        percentage: tankPercentage,
        currentLiters: currentLevel,
        capacityLiters: totalCapacity,
        status: tankPercentage < 30 ? "critical" : tankPercentage < 60 ? "moderate" : "optimal",
      },
      todayConsumption: {
        value: todayConsumption,
        unit: "L",
        trendPercent: consumptionTrend,
        status: "normal",
      },
      rainfallRecorded: {
        value: totalRainfall,
        unit: "mm (last 30d)",
        rechargePotentialLiters: Math.round(totalRainfall * 3550 * 0.85),
      },
    },
    charts: {
      groundwaterTrend: chartData,
      consumptionTrend: consumptionChart,
    },
    tanks: tanks.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.tankType,
      capacityLiters: t.capacityLiters,
      currentLevelLiters: t.currentLevelLiters,
      currentPercentage: t.currentPercentage,
      status: t.status,
    })),
    recentAlerts: alerts.slice(0, 4),
    recentActivities: communityLogs.slice(0, 4),
    recentLeakages: leakage.slice(0, 3),
  });
}

