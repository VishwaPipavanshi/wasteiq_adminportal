import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import { getAdminFromToken } from "@/helpers/getAdminFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    // Verify admin is authenticated
    getAdminFromToken(request);

    const workers = await Worker.find({})
      .select("-password -forgotPasswordOTP -forgotPasswordOTPExpiry")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, workers });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
