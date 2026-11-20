import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const logs = db.getCommunityLogs(communityId);
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLog = db.addCommunityLog({
      communityId: body.communityId || "comm-01",
      authorName: body.authorName || "Community Member",
      logType: body.logType || "water_availability",
      title: body.title,
      content: body.content,
      metricValue: body.metricValue ? Number(body.metricValue) : undefined,
      metricUnit: body.metricUnit,
      isVerified: false,
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create community log" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Missing log ID" }, { status: 400 });
    const verified = db.verifyCommunityLog(id);
    return NextResponse.json(verified);
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify log" }, { status: 500 });
  }
}

