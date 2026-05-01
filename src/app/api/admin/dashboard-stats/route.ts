import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import Worker from "@/models/WorkerModel";
import User from "@/models/userModel";
import Shift from "@/models/shiftModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const dateFilter: any = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.timestamp.$lte = end;
            }
        }

        // Stats
        const totalReports = await Report.countDocuments(dateFilter);
        const pendingReports = await Report.countDocuments({ ...dateFilter, status: "pending" });
        const verifiedReports = await Report.countDocuments({ ...dateFilter, status: { $in: ["verified", "completed"] } });

        // Active Workers from Shifts collection
        // const activeWorkers = await Shift.countDocuments({ status: "active" });
        const activeWorkersData = await Shift.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: "$user_id" } } // unique workers
        ]);
        const activeWorkers = activeWorkersData.length;
        const totalWorkers = await Worker.countDocuments({ isActive: true });

        const idleWorkers = totalWorkers - activeWorkers;
        // Reports Trend (daily counts using 'timestamp' field)
        const reportsTrendData = await Report.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", count: 1, _id: 0 } }
        ]);

        // Recent Citizens with Online Status
        const recentCitizens = await Report.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$user_id",
                    reportCount: { $sum: 1 },
                    username: { $first: "$username" }
                }
            },
            { $sort: { reportCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "shifts",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "shifts"
                }
            },
            {
                $project: {
                    name: "$username",
                    tasksCompleted: "$reportCount",
                    _id: 1,
                    isOnline: {
                        $cond: {
                            if: { $eq: [{ $arrayElemAt: ["$shifts.status", -1] }, "active"] },
                            then: true,
                            else: false
                        }
                    },
                    lastActive: { $arrayElemAt: ["$shifts.end_time", -1] }
                }
            }
        ]);

        return NextResponse.json({
            stats: {
                totalReports,
                pendingReports,
                verifiedReports,
                activeWorkers,
                totalWorkers,
                idleWorkers
            },
            reportsTrend: reportsTrendData,
            topPerformers: recentCitizens
        }, { status: 200 });

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
