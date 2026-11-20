import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const schedules = db.getTankerSchedules(communityId);
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSchedule = db.addTankerSchedule({
      communityId: body.communityId || "comm-01",
      vendorName: body.vendorName,
      driverName: body.driverName || "Driver Unassigned",
      driverPhone: body.driverPhone || "+91 90000 00000",
      vehicleNumber: body.vehicleNumber,
      capacityLiters: Number(body.capacityLiters || 12000),
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime || "11:00 AM",
      status: body.status || "scheduled",
      targetTankId: body.targetTankId,
      notes: body.notes,
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tanker schedule" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updated = db.updateTankerStatus(id, status, notes);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tanker status" }, { status: 500 });
  }
}

