import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import { getAdminFromToken } from "@/helpers/getAdminFromToken";
import { generatePassword } from "@/helpers/generateWorkerCredentials";
import { sendEmail } from "@/helpers/sendEmail";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    // Must be an authenticated admin
    const adminId = getAdminFromToken(request);

    const body = await request.json();
    const { firstName, middleName, lastName, email, mobile, aadhaar, address, zone, ward } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !mobile || !aadhaar || !address || !zone || !ward) {
      return NextResponse.json(
        { message: "firstName, lastName, email, mobile, aadhaar, address, zone, and ward are required" },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await Worker.findOne({ $or: [{ email: email.toLowerCase() }, { aadhaar }] });
    if (existing) {
      const conflict = existing.email === email.toLowerCase() ? "Email" : "Aadhaar number";
      return NextResponse.json({ message: `${conflict} is already registered` }, { status: 400 });
    }

    // Generate a secure random password (shown to admin once)
    const plainPassword = generatePassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create worker
    const worker = new Worker({
      firstName: firstName.trim(),
      middleName: middleName?.trim() || "",
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      aadhaar: aadhaar.trim(),
      address: address.trim(),
      password: hashedPassword,
      zone,
      ward,
      createdBy: adminId,
      isActive: true,
    });

    const savedWorker = await worker.save();

    // Optionally email the credentials to the worker
    try {
      await sendEmail({
        to: savedWorker.email,
        subject: "Your Clean-AI Worker App Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #4E9F3D;">Welcome to Clean-AI Worker App</h2>
            <p>Hello <strong>${savedWorker.firstName} ${savedWorker.lastName}</strong>,</p>
            <p>Your account has been created. Use the credentials below to log in:</p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Email:</strong> ${savedWorker.email}</p>
              <p style="margin: 4px 0;"><strong>Password:</strong> ${plainPassword}</p>
            </div>
            <p style="color: #6b7280; font-size: 13px;">Please change your password after your first login.</p>
          </div>
        `,
      });
    } catch {
      // Email is best-effort — don't fail the request if email fails
      console.warn("Failed to send credential email to worker");
    }

    return NextResponse.json({
      message: "Worker created successfully",
      success: true,
      worker: {
        _id: savedWorker._id,
        firstName: savedWorker.firstName,
        middleName: savedWorker.middleName,
        lastName: savedWorker.lastName,
        email: savedWorker.email,
        mobile: savedWorker.mobile,
        zone: savedWorker.zone,
        ward: savedWorker.ward,
        isActive: savedWorker.isActive,
        createdAt: savedWorker.createdAt,
      },
      // Plain text password returned ONCE — store it securely or give to worker directly
      credentials: {
        email: savedWorker.email,
        password: plainPassword,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
