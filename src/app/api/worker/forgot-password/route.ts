import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import { sendEmail } from "@/helpers/sendEmail";
import crypto from "crypto";

connect();

/**
 * POST /api/worker/forgot-password
 * Used by the Flutter Worker App on the "Forgot Password" screen.
 * Body: { email }
 * Sends a 6-digit OTP to the worker's registered email.
 * OTP is valid for 10 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const worker = await Worker.findOne({ email: email.toLowerCase() });

    // Always respond with success to avoid leaking which emails exist
    if (!worker) {
      return NextResponse.json({
        success: true,
        message: "If this email is registered, an OTP has been sent",
      });
    }

    if (!worker.isActive) {
      return NextResponse.json(
        { message: "Your account has been deactivated. Please contact your admin." },
        { status: 403 }
      );
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    worker.forgotPasswordOTP = otp;
    worker.forgotPasswordOTPExpiry = otpExpiry;
    await worker.save();

    await sendEmail({
      to: worker.email,
      subject: "Clean-AI Worker App — Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #4E9F3D; margin: 0;">🌿 Clean-AI</h2>
            <p style="color: #6b7280; margin: 4px 0;">Worker App Password Reset</p>
          </div>
          <p>Hello <strong>${worker.firstName} ${worker.lastName}</strong>,</p>
          <p>Use the OTP below to reset your password. This code expires in <strong>10 minutes</strong>.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1E5128;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent to your registered email address",
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
