import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const tanks = db.getWaterTanks(communityId);
  return NextResponse.json(tanks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTank = db.addWaterTank({
      communityId: body.communityId || "comm-01",
      name: body.name,
      tankType: body.tankType || "overhead",
      capacityLiters: Number(body.capacityLiters),
      heightMeters: Number(body.heightMeters || 4.5),
      currentLevelLiters: Number(body.currentLevelLiters || body.capacityLiters * 0.75),
      currentPercentage: Math.round(((body.currentLevelLiters || body.capacityLiters * 0.75) / body.capacityLiters) * 100),
      status: "optimal",
      sensorId: body.sensorId,
    });

    return NextResponse.json(newTank, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add tank" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, currentLevelLiters } = body;
    if (!id || currentLevelLiters === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = db.updateTankLevel(id, Number(currentLevelLiters));
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tank level" }, { status: 500 });
  }
}

