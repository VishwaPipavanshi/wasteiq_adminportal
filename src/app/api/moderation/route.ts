import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
    try {
        // Fetch only flagged reports for moderation
        const reports = await Report.find({ status: { $in: ["flagged", "rejected"] } }).sort({ timestamp: -1 });

        return NextResponse.json({
            success: true,
            reports
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { reportId, action } = body; // action: 'approve' | 'reject'

        if (!reportId || !action) {
            return NextResponse.json({ error: "Report ID and action are required" }, { status: 400 });
        }

        let status;
        let is_genuine;

        if (action === "approve") {
            status = "pending"; // will go for worker assignment
            is_genuine = true;
        } else {
            status = "rejected";
            is_genuine = false;
        }
        // const is_genuine = action === "approve";

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status, is_genuine },
            { new: true }
        );

        if (!updatedReport) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: `Report ${action}d successfully`,
            success: true,
            report: updatedReport
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
