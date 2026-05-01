import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

/**
 * POST /api/worker/login
 * Used by the Flutter Worker App.
 * Returns a Bearer token — Flutter stores it in secure storage.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const worker = await Worker.findOne({ email: email.toLowerCase() });
    if (!worker) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    if (!worker.isActive) {
      return NextResponse.json(
        { message: "Your account has been deactivated. Please contact your admin." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, worker.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    // Include type: 'worker' to distinguish from admin tokens
    const tokenData = {
      id: worker._id,
      email: worker.email,
      type: "worker",
    };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "7d" });

    return NextResponse.json({
      message: "Login successful",
      success: true,
      token, // Flutter stores this as: Authorization: Bearer <token>
      worker: {
        _id: worker._id,
        firstName: worker.firstName,
        middleName: worker.middleName,
        lastName: worker.lastName,
        email: worker.email,
        mobile: worker.mobile,
        zone: worker.zone,
        ward: worker.ward,
        isActive: worker.isActive,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
