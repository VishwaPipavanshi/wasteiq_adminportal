import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";

connect();

export async function GET(request: NextRequest) {
  try{
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    if (!workerId) {
            return NextResponse.json({ error: "workerId required" }, { status: 400 });
        }

    const tasks = await Report.find({
        worker_id: workerId,
        status: { $in: ["in-progress"] }
    });
  }
  catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
  try{
    const body = await request.json();
    const { reportId, workerImageUrl } = body;

    if (!reportId || !workerImageUrl) {
            return NextResponse.json(
                { error: "reportId and workerImageUrl required" },
                { status: 400 }
            );
    }
    const report = await Report.findById(reportId);

    if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }


    report.worker_completed_image = workerImageUrl;
    report.status = "verification-pending"; // VERY IMPORTANT NEW STATUS

    await report.save();

    return NextResponse.json({
        success: true,
        message: "Marked for verification"
    });
  }catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}