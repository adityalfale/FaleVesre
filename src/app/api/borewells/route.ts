import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const borewells = db.getBorewells(communityId);
  return NextResponse.json(borewells);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBorewell = db.addBorewell({
      communityId: body.communityId || "comm-01",
      name: body.name,
      code: body.code || `BW-${Date.now().toString().slice(-4)}`,
      totalDepthMeters: Number(body.totalDepthMeters),
      casingDepthMeters: Number(body.casingDepthMeters || 30),
      pumpInstalledDepthMeters: Number(body.pumpInstalledDepthMeters || body.totalDepthMeters * 0.8),
      pumpPowerHp: Number(body.pumpPowerHp || 5),
      pumpFlowRateLpm: Number(body.pumpFlowRateLpm || 60),
      status: body.status || "active",
      currentDepthToWaterMeters: Number(body.currentDepthToWaterMeters || 15.0),
      currentWaterColumnMeters: Number(body.totalDepthMeters - (body.currentDepthToWaterMeters || 15.0)),
      installationDate: body.installationDate || new Date().toISOString().split("T")[0],
      source: body.source || "manual_verified",
    });

    return NextResponse.json(newBorewell, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create borewell record" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, depthToWaterMeters, source } = body;
    if (!id || depthToWaterMeters === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = db.updateBorewellReading(id, Number(depthToWaterMeters), source || "manual_verified");
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update borewell" }, { status: 500 });
  }
}

