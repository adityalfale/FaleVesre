import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { UserRole } from "@/types";

export async function GET() {
  const profiles = db.getProfiles();
  // Return current active profile (default to society admin for maximum feature demo access)
  const current = profiles[1] || profiles[0];
  return NextResponse.json({
    user: current,
    availableProfiles: profiles,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, role } = body;

    if (profileId) {
      const profile = db.getProfileById(profileId);
      if (profile) {
        if (role) {
          db.updateProfileRole(profileId, role as UserRole);
        }
        return NextResponse.json({ success: true, user: profile });
      }
    }

    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 400 });
  }
}

