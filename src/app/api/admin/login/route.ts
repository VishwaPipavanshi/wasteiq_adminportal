import { connect } from "@/dbConfig/dbConfig";
import Admin from "@/models/adminModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    // Create JWT token — include type: 'admin' to distinguish from worker tokens
    const tokenData = {
      id: admin._id,
      email: admin.email,
      username: admin.username,
      type: "admin",
    };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
