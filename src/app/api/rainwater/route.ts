import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const units = db.getHarvestingUnits(communityId);
  return NextResponse.json(units);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a calculator evaluation or registering a unit
    if (body.action === "calculate") {
      const { roofAreaSqm, rainfallMm, runoffCoefficient = 0.85 } = body;
      const area = Number(roofAreaSqm);
      const rain = Number(rainfallMm);
      const coeff = Number(runoffCoefficient);

      // Scientifically correct formula:
      // Harvestable water (Litres) = Area (m2) * Rainfall (mm) * Runoff Coefficient
      const harvestableLiters = area * rain * coeff;
      const rechargePotentialLiters = harvestableLiters * 0.70;
      const daysOfWaterSecurity = Math.floor(harvestableLiters / (380 * 135)); // 380 households @ 135 LPCD

      return NextResponse.json({
        roofAreaSqm: area,
        rainfallMm: rain,
        runoffCoefficient: coeff,
        harvestableLiters: Math.round(harvestableLiters),
        harvestableKiloliters: Number((harvestableLiters / 1000).toFixed(1)),
        rechargePotentialLiters: Math.round(rechargePotentialLiters),
        daysOfWaterSecurity,
        formulaExplanation: "Harvestable Volume (L) = Catchment Area (m²) × Rainfall (mm) × Runoff Efficiency Coefficient (0.80 - 0.90 for RCC/Metal roofs)",
      });
    }

    // Register harvesting unit
    const newUnit = db.addHarvestingUnit({
      communityId: body.communityId || "comm-01",
      buildingName: body.buildingName,
      catchmentAreaSqm: Number(body.catchmentAreaSqm),
      harvestingMethod: body.harvestingMethod || "hybrid",
      storageCapacityLiters: Number(body.storageCapacityLiters || 50000),
      runoffCoefficient: Number(body.runoffCoefficient || 0.85),
      installationDate: body.installationDate || new Date().toISOString().split("T")[0],
      filterType: body.filterType || "Sand and gravel dual-media filter",
    });

    return NextResponse.json(newUnit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process rainwater request" }, { status: 400 });
  }
}

