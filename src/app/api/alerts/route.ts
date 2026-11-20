import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId") || undefined;
  const alerts = db.getAlerts(communityId);
  return NextResponse.json(alerts);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, markAll, communityId } = body;

    if (markAll) {
      db.markAllAlertsAsRead(communityId);
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      const updated = db.markAlertAsRead(id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

