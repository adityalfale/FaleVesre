import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "groundwater";
  const format = searchParams.get("format") || "csv";

  let csvContent = "";
  let filename = `aquasense_${type}_report_${new Date().toISOString().split("T")[0]}.csv`;

  if (type === "groundwater") {
    const borewells = db.getBorewells();
    const primaryId = borewells[0]?.id || "bw-001";
    const readings = db.getGroundwaterReadings(primaryId);

    csvContent = "ID,Borewell,Depth_To_Water_Meters,Water_Column_Meters,Source,Measured_At\n";
    readings.forEach((r) => {
      csvContent += `"${r.id}","${primaryId}",${r.depthToWaterMeters},${r.waterColumnMeters},"${r.source}","${r.measuredAt}"\n`;
    });
  } else if (type === "consumption") {
    const consumption = db.getWaterConsumption();
    csvContent = "ID,Date,Liters_Consumed,Consumption_Type\n";
    consumption.forEach((c) => {
      csvContent += `"${c.id}","${c.date}",${c.liters},"${c.type}"\n`;
    });
  } else if (type === "tanker") {
    const tankers = db.getTankerSchedules();
    csvContent = "ID,Vendor_Name,Vehicle_Number,Capacity_Liters,Scheduled_Date,Scheduled_Time,Status,Notes\n";
    tankers.forEach((t) => {
      csvContent += `"${t.id}","${t.vendorName}","${t.vehicleNumber}",${t.capacityLiters},"${t.scheduledDate}","${t.scheduledTime}","${t.status}","${t.notes || ""}"\n`;
    });
  } else if (type === "leakage") {
    const leakage = db.getLeakageReports();
    csvContent = "ID,Title,Leakage_Type,Severity,Status,Estimated_Loss_Liters,Reported_By,Created_At\n";
    leakage.forEach((l) => {
      csvContent += `"${l.id}","${l.title}","${l.leakageType}","${l.severity}","${l.status}",${l.estimatedWaterLossLiters},"${l.reporterName}","${l.createdAt}"\n`;
    });
  } else {
    const units = db.getHarvestingUnits();
    csvContent = "ID,Building_Name,Catchment_Area_Sqm,Harvesting_Method,Storage_Capacity_Liters,Runoff_Coefficient\n";
    units.forEach((u) => {
      csvContent += `"${u.id}","${u.buildingName}",${u.catchmentAreaSqm},"${u.harvestingMethod}",${u.storageCapacityLiters},${u.runoffCoefficient}\n`;
    });
  }

  if (format === "json") {
    return NextResponse.json({
      type,
      exportedAt: new Date().toISOString(),
      recordCount: csvContent.split("\n").length - 2,
      data: csvContent,
    });
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

