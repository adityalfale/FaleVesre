import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET() {
  const sensors = db.getSensors();
  return NextResponse.json(sensors);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's an authenticated hardware sensor ingestion ping
    if (body.action === "telemetry_ingest") {
      const { deviceUid, apiToken, readingValue } = body;
      const sensors = db.getSensors();
      const device = sensors.find((s) => s.deviceUid === deviceUid);

      if (!device) {
        return NextResponse.json({ error: "Device not registered in AquaSense" }, { status: 404 });
      }

      if (device.apiToken !== apiToken) {
        return NextResponse.json({ error: "Unauthorized: Invalid hardware authentication token" }, { status: 401 });
      }

      const updated = db.recordSensorPing(deviceUid, Number(readingValue));
      return NextResponse.json({
        status: "acknowledged",
        deviceUid,
        receivedAt: new Date().toISOString(),
        device: updated,
      });
    }

    // Otherwise it is device registration
    const newSensor = db.registerSensor({
      deviceUid: body.deviceUid || `ESP32-NODE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      deviceType: body.deviceType || "pressure_transducer",
      borewellId: body.borewellId,
      locationName: body.locationName || "Monitored Station",
      hardwareModel: body.hardwareModel || "ESP32-AquaSense-Edge",
      firmwareVersion: "v2.5.0",
      connectionProtocol: body.connectionProtocol || "wifi_http",
      apiToken: `sec_tok_${Math.random().toString(36).substring(2, 12)}`,
      status: "online",
      batteryPercentage: 100,
      signalStrengthRssi: -58,
    });

    return NextResponse.json(newSensor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process device operation" }, { status: 400 });
  }
}

