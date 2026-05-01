import { getAdminFromToken } from "@/helpers/getAdminFromToken";
import { NextRequest, NextResponse } from "next/server";
import Admin from "@/models/adminModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function GET(request: NextRequest) {
  try {
    const adminId = getAdminFromToken(request);
    const admin = await Admin.findById(adminId).select("-password -forgotPasswordToken -verifyToken");
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Admin found",
      data: admin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
