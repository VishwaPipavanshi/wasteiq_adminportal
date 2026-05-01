// import { connect } from "@/dbConfig/dbConfig";
// import Report from "@/models/reportModel";
// import Worker from "@/models/WorkerModel";
// import { NextRequest, NextResponse } from "next/server";
// import { calculateDistance } from "@/helpers/geoUtils";

// connect();

// export async function POST(request: NextRequest) {
//   try {
//     // Find reports missing worker_id
//     const reports = await Report.find({ worker_id: null });
//     if (!reports.length) {
//       return NextResponse.json({ success: true, updated: 0, message: "No reports to backfill" });
//     }

//     const workers = await Worker.find({});
//     if (!workers.length) {
//       return NextResponse.json({ success: false, message: "No workers found in DB" }, { status: 400 });
//     }

//     let updated = 0;

//     for (const r of reports) {
//       try {
//         const model = r.model_result || {};
//         const mass = model.total_mass ?? 0;
//         const coverage = model.coverage ?? (model.sustainability_summary?.coverage ?? 0);
//         let severity: "high" | "medium" | "low" = "low";
//         if (mass >= 1 || coverage >= 70) severity = "high";
//         else if (mass >= 0.2 || coverage >= 30) severity = "medium";

//         const radiusBySeverity: Record<string, number> = { high: 50, medium: 30, low: 15 };
//         const radius = radiusBySeverity[severity];

//         // try active workers first
//         const activeWorkers = workers.filter((w) => w.isActive);
//         let minDist = Infinity;
//         let nearest: any = null;
//         for (const w of activeWorkers) {
//           if (w.location?.lat != null && w.location?.lng != null && r.location?.lat != null && r.location?.lng != null) {
//             const d = calculateDistance(r.location.lat, r.location.lng, w.location.lat, w.location.lng);
//             if (d < minDist) {
//               minDist = d;
//               nearest = w;
//             }
//           }
//         }

//         if (nearest && minDist <= radius) {
//           r.worker_id = nearest._id;
//           r.assigned_at = r.assigned_at || new Date();
//           r.status = "in-progress";
//           await r.save();
//           updated++;
//           continue;
//         }

//         // fallback to nearest any worker
//         minDist = Infinity;
//         nearest = null;
//         for (const w of workers) {
//           if (w.location?.lat && w.location?.lng && r.location?.lat && r.location?.lng) {
//             const d = calculateDistance(r.location.lat, r.location.lng, w.location.lat, w.location.lng);
//             if (d < minDist) {
//               minDist = d;
//               nearest = w;
//             }
//           }
//         }

//         if (nearest) {
//           r.worker_id = nearest._id;
//           r.assigned_at = r.assigned_at || new Date();
//           r.status = "in-progress";
//           await r.save();
//           updated++;
//         }
//       } catch (err) {
//         console.error("backfill error for report", r._id, err);
//       }
//     }

//     return NextResponse.json({ success: true, updated }, { status: 200 });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ success: true, message: "POST to this endpoint to backfill reports" });
// }

import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import Worker from "@/models/WorkerModel";
import { NextResponse } from "next/server";
import { calculateDistance } from "@/helpers/geoUtils";

connect();

export async function POST() {
  try {
    const reports = await Report.find({ worker_id: null });
    if (!reports.length) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: "No reports to backfill",
      });
    }

    const workers = await Worker.find({});
    if (!workers.length) {
      return NextResponse.json(
        { success: false, message: "No workers found" },
        { status: 400 }
      );
    }

    let updated = 0;

    for (const r of reports) {
      try {
        // ✅ SAFE location check
        if (r.location?.lat == null || r.location?.lng == null) continue;

        // ✅ USE MODEL SEVERITY (FIXED)
        let severity: "high" | "medium" | "low" =
          r.model_result?.sustainability_summary?.severity?.toLowerCase() || "low";

        const radiusBySeverity: Record<string, number> = {
          high: 50,
          medium: 30,
          low: 15,
        };

        const radius = radiusBySeverity[severity];

        // =========================
        // 🔵 STEP 1: ACTIVE WORKERS
        // =========================
        let minDist = Infinity;
        let nearest: any = null;

        const activeWorkers = workers.filter((w) => w.isActive);

        for (const w of activeWorkers) {
          if (w.location?.lat != null && w.location?.lng != null) {
            const d = calculateDistance(
              r.location.lat,
              r.location.lng,
              w.location.lat,
              w.location.lng
            );

            if (d < minDist) {
              minDist = d;
              nearest = w;
            }
          }
        }

        // ✅ Assign if within radius
        if (nearest && minDist <= radius) {
          r.worker_id = nearest._id;
          r.status = "in-progress";
          r.assigned_at = r.assigned_at || new Date();
          await r.save();
          updated++;
          continue;
        }

        // =========================
        // 🟡 STEP 2: FALLBACK (ANY WORKER)
        // =========================
        minDist = Infinity;
        nearest = null;

        for (const w of workers) {
          if (w.location?.lat != null && w.location?.lng != null) {
            console.log("REPORT:", r._id);
            console.log("Report Location:", r.location);
            console.log("Worker Location:", w.location);
            const d = calculateDistance(
              r.location.lat,
              r.location.lng,
              w.location.lat,
              w.location.lng
            );

            if (d < minDist) {
              minDist = d;
              nearest = w;
            }
          }
        }

        if (nearest) {
          r.worker_id = nearest._id;
          r.status = "in-progress";
          r.assigned_at = r.assigned_at || new Date();
          await r.save();
          updated++;
        }

      } catch (err) {
        console.error("Backfill error for report:", r._id, err);
      }
    }

    return NextResponse.json(
      { success: true, updated },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "POST to this endpoint to backfill reports",
  });
}