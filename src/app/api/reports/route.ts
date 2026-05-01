import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import Worker from "@/models/WorkerModel";
import { NextRequest, NextResponse } from "next/server";
import { calculateDistance } from "@/helpers/geoUtils";
import { validateReport } from "@/helpers/reportValidation";


interface IWorker {
    _id: string;
    isActive: boolean;
    location?: {
        lat: number;
        lng: number;
    };
}

connect();


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, username, image_url, location, model_result,address } = body;

        // // Automated Genuineness System
        // let is_genuine = true;
        // let flagged_reason = "";
        // let status = "pending";

        const { is_genuine, flagged_reason, status } = validateReport(model_result);

        // Find Nearest Worker Logic
        let assignedWorkerId = null;
        let finalStatus = status;

        if (!is_genuine) {
            finalStatus = "flagged"; // force
        } else {
            try {
                // Determine severity from model_result (simple heuristic)
                const mass =
                    model_result?.sustainability_summary?.total_estimated_weight_kg ??
                    0;

                // const coverage =
                //     model_result?.coverage ??
                //     model_result?.sustainability_summary?.coverage ??
                //     0;
                const severityRaw = model_result?.sustainability_summary?.severity || "low";

                const severity = ["high", "medium", "low"].includes(severityRaw.toLowerCase())
                    ? severityRaw.toLowerCase()
                    : "low";
                // radius (km) by severity: high -> larger radius
                const radiusBySeverity: Record<string, number> = {
                    high: 50,
                    medium: 30,
                    low: 15,
                };

                const radius = radiusBySeverity[severity];

                const activeWorkers = await Worker.find({ isActive: true });
                let minDistance = Infinity;
                let nearestWorker: IWorker | null = null;

                activeWorkers.forEach((worker: any) => {
                    const w = worker as IWorker;
                    if (w.location?.lat != null && w.location?.lng != null) {
                        const dist = calculateDistance(
                            location.lat,
                            location.lng,
                            w.location.lat,
                            w.location.lng
                        );
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestWorker = w;
                        }
                    }
                });

                // Assign to nearest active worker only if within severity radius
                if (nearestWorker && minDistance <= radius) {
                    assignedWorkerId = (nearestWorker as IWorker)._id;
                    finalStatus = "in-progress";
                } else {
                    // No active worker within radius — fallback to nearest worker (including inactive)
                    const allWorkers = await Worker.find({});
                    let minAll = Infinity;
                    let nearestAny: IWorker | null = null;
                    allWorkers.forEach((worker: any) => {
                        const w = worker as IWorker;
                        if (w.location?.lat != null && w.location?.lng != null) {
                            const dist = calculateDistance(
                                location.lat,
                                location.lng,
                                w.location.lat,
                                w.location.lng
                            );
                            if (dist < minAll) {
                                minAll = dist;
                                nearestAny = w;
                            }
                        }
                    });

                    if (nearestAny) {
                        // Assign even if the worker is not active (use last known location)
                        assignedWorkerId = (nearestAny as IWorker)._id;
                        finalStatus = "in-progress";
                    } else {
                        assignedWorkerId = null;
                        finalStatus = "pending";
                    }
                }
            } catch (err) {
                console.error("Worker assignment error:", err);
                finalStatus = "pending";
            }
        }

        const newReport = new Report({
            user_id,
            username,
            image_url,
            location,
            address,
            model_result,
            is_genuine,
            flagged_reason,
            status: finalStatus,
            worker_id: assignedWorkerId,
            assigned_at: assignedWorkerId ? new Date() : null,
            timestamp: new Date()
        });

        const savedReport = await newReport.save();

        return NextResponse.json({
            message: "Report created successfully",
            success: true,
            report: savedReport
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const filter: any = {};
        if (status && status !== "all") {
            filter.status = status;
        }

        const reports = await Report.find(filter)
            .populate("worker_id")
            .sort({ timestamp: -1 });

// Add frontend-friendly fields
        const formattedReports = reports.map((report: any) => ({
            ...report.toObject(),

            // Cleanup image
            worker_completed_image: report.after_image_url || null,

            // Cleanup completed time
            completed_at: report.completed_at || null,
        }));


        return NextResponse.json({
            success: true,
            reports:formattedReports,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
