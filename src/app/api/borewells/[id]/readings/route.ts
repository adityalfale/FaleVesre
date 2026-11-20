import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const readings = db.getGroundwaterReadings(params.id);
  return NextResponse.json(readings);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const bw = db.getBorewellById(params.id);
    if (!bw) {
      return NextResponse.json({ error: "Borewell not found" }, { status: 404 });
    }

    const depth = Number(body.depthToWaterMeters);
    const newReading = db.addGroundwaterReading({
      borewellId: params.id,
      depthToWaterMeters: depth,
      waterColumnMeters: Number(Math.max(0, bw.totalDepthMeters - depth).toFixed(2)),
      temperatureCelsius: body.temperatureCelsius ? Number(body.temperatureCelsius) : 24.0,
      source: body.source || "manual_verified",
      measuredAt: body.measuredAt || new Date().toISOString(),
      notes: body.notes,
    });

    return NextResponse.json(newReading, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log groundwater reading" }, { status: 400 });
  }
}

