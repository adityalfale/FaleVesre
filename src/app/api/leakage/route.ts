import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const reports = db.getLeakageReports(communityId);
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReport = db.addLeakageReport({
      communityId: body.communityId || "comm-01",
      reportedBy: body.reportedBy,
      reporterName: body.reporterName || "Anonymous Resident",
      title: body.title,
      description: body.description,
      leakageType: body.leakageType || "pipe_burst",
      severity: body.severity || "medium",
      latitude: Number(body.latitude || 12.9352),
      longitude: Number(body.longitude || 77.7298),
      locationDescription: body.locationDescription || "Near building premises",
      photoUrl: body.photoUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=600&q=80",
      status: "submitted",
      estimatedWaterLossLiters: Number(body.estimatedWaterLossLiters || 50),
      assignedTo: undefined,
      resolutionNotes: undefined,
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit leakage report" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, resolutionNotes, assignedTo } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = db.updateLeakageStatus(id, status, resolutionNotes, assignedTo);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leakage report" }, { status: 500 });
  }
}

