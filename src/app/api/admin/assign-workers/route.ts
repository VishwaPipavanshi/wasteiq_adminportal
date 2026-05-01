import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import Worker from "@/models/WorkerModel";
import { NextResponse } from "next/server";
import { calculateDistance } from "@/helpers/geoUtils";
import { validateReport } from "@/helpers/reportValidation";

connect();

// 📍 Mapbox Reverse Geocoding
async function getReadableAddress(lat: number, lng: number) {
  try {
    const token = process.env.MAPBOX_TOKEN;

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
    );

    const data = await res.json();
    return data.features?.[0]?.place_name || "Unknown location";
  } catch (error) {
    console.error("Mapbox Error:", error);
    return "Address not available";
  }
}

export async function POST() {
  try {
    const reports = await Report.find({ worker_id: null,
                                        status: { $ne: "flagged" } 
                                      });

    if (!reports.length) {
      return NextResponse.json({
        success: true,
        message: "No unassigned reports",
        updated: 0,
      });
    }

    const workers = await Worker.find({});
    if (!workers.length) {
      return NextResponse.json({
        success: false,
        message: "No workers found",
      });
    }

    let updated = 0;

    for (const r of reports) {
      try {
        // ✅ Skip invalid location
        if (r.location?.lat == null || r.location?.lng == null) continue;

        // =========================
        // 🤖 AI VALIDATION
        // =========================
        // const { is_genuine, flagged_reason, status } = validateReport(
        //   r.model_result
        // );

        // let finalStatus = status;
        let assignedWorkerId = null;

        // =========================
        // 🚫 FAKE REPORT
        // =========================
        // if (!is_genuine) {
        //   r.is_genuine = false;
        //   r.flagged_reason = flagged_reason;
        //   r.status = "flagged";
        //   await r.save();
        //   continue;
        // }
        if (r.status === "flagged") {
   continue;
}

let finalStatus = r.status || "pending";
// let assignedWorkerId = null;

        // =========================
        // 📍 ADDRESS UPDATE (optional)
        // =========================
        if (!r.address) {
          r.address = await getReadableAddress(
            r.location.lat,
            r.location.lng
          );
        }

        // =========================
        // 🔥 SEVERITY LOGIC
        // =========================
        const severityRaw =
          r.model_result?.sustainability_summary?.severity || "low";

        const severity = ["high", "medium", "low"].includes(
          severityRaw.toLowerCase()
        )
          ? severityRaw.toLowerCase()
          : "low";

        const radiusBySeverity: Record<string, number> = {
          high: 50,
          medium: 30,
          low: 15,
        };

        const radius = radiusBySeverity[severity];

        // =========================
        // 🔵 STEP 1: ACTIVE WORKERS
        // =========================
        const activeWorkers = workers.filter((w) => w.isActive);

        let minDistance = Infinity;
        let nearestWorker: any = null;

        for (const w of activeWorkers) {
          if (w.location?.lat != null && w.location?.lng != null) {
            const dist = calculateDistance(
              r.location.lat,
              r.location.lng,
              w.location.lat,
              w.location.lng
            );

            if (dist < minDistance) {
              minDistance = dist;
              nearestWorker = w;
            }
          }
        }

        if (nearestWorker && minDistance <= radius) {
          assignedWorkerId = nearestWorker._id;
          finalStatus = "in-progress";
        } else {
          // =========================
          // 🟡 STEP 2: FALLBACK
          // =========================
          let minAll = Infinity;
          let nearestAny: any = null;

          for (const w of workers) {
            if (w.location?.lat != null && w.location?.lng != null) {
              const dist = calculateDistance(
                r.location.lat,
                r.location.lng,
                w.location.lat,
                w.location.lng
              );

              if (dist < minAll) {
                minAll = dist;
                nearestAny = w;
              }
            }
          }

          if (nearestAny) {
            assignedWorkerId = nearestAny._id;
            finalStatus = "in-progress";
          } else {
            finalStatus = "pending";
          }
        }

        // =========================
        // 💾 UPDATE REPORT
        // =========================
        r.worker_id = assignedWorkerId;
        r.status = finalStatus;
        r.is_genuine = true;
        r.flagged_reason = "";
        r.assigned_at = assignedWorkerId ? new Date() : null;

        await r.save();
        updated++;

      } catch (err) {
        console.error("Assignment error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      updated,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}