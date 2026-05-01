import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import { getWorkerFromToken } from "@/helpers/getWorkerFromToken";
import bcrypt from "bcryptjs";

connect();

/**
 * POST /api/worker/change-password
 * Used by the Flutter Worker App after login.
 * Requires: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword, confirmPassword }
 */
export async function POST(request: NextRequest) {
  try {
    const workerId = getWorkerFromToken(request);
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "currentPassword, newPassword, and confirmPassword are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return NextResponse.json({ message: "Worker not found" }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, worker.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    worker.password = await bcrypt.hash(newPassword, 10);
    await worker.save();

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
