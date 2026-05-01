import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import bcrypt from "bcryptjs";

connect();

/**
 * POST /api/worker/reset-password
 * Step 2 of forgot-password flow.
 * Body: { email, otp, newPassword, confirmPassword }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword, confirmPassword } = await request.json();

    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "email, otp, newPassword, and confirmPassword are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    const worker = await Worker.findOne({ email: email.toLowerCase() });

    if (!worker || !worker.forgotPasswordOTP) {
      return NextResponse.json(
        { message: "Invalid request. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (!worker.forgotPasswordOTPExpiry || worker.forgotPasswordOTPExpiry < new Date()) {
      // Clear expired OTP
      worker.forgotPasswordOTP = null;
      worker.forgotPasswordOTPExpiry = null;
      await worker.save();
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (worker.forgotPasswordOTP !== otp.toString()) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Set new password and clear OTP
    worker.password = await bcrypt.hash(newPassword, 10);
    worker.forgotPasswordOTP = null;
    worker.forgotPasswordOTPExpiry = null;
    await worker.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
