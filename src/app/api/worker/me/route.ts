import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import { getWorkerFromToken } from "@/helpers/getWorkerFromToken";

connect();

/**
 * GET /api/worker/me
 * Used by the Flutter Worker App to fetch the logged-in worker's profile.
 * Requires: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    const workerId = getWorkerFromToken(request);

    const worker = await Worker.findById(workerId).select(
      "-password -forgotPasswordOTP -forgotPasswordOTPExpiry"
    );

    if (!worker) {
      return NextResponse.json({ message: "Worker not found" }, { status: 404 });
    }

    if (!worker.isActive) {
      return NextResponse.json(
        { message: "Account is deactivated. Contact admin." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, worker });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
