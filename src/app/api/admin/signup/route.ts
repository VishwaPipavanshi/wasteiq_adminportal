import { connect } from "@/dbConfig/dbConfig";
import Admin from "@/models/adminModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const {
      fullName,
      email,
      mobile,
      password,
      confirmPassword,
      employeeId,
      department,
      designation,
      role,
      zone,
      ward,
      officeLocation,
    } = reqBody;

    // Validate required fields
    if (!fullName || !email || !mobile || !password || !employeeId || !department || !designation || !role || !zone || !ward || !officeLocation) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    // Check if admin already exists by email or employeeId
    const existingAdmin = await Admin.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (existingAdmin) {
      const field = existingAdmin.email === email.toLowerCase() ? "Email" : "Employee ID";
      return NextResponse.json({ message: `${field} is already registered` }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      username: fullName,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      employeeId,
      department,
      designation,
      role,
      zone,
      ward,
      officeLocation,
    });

    const savedAdmin = await newAdmin.save();

    return NextResponse.json({
      message: "Account created successfully",
      success: true,
      admin: {
        _id: savedAdmin._id,
        username: savedAdmin.username,
        email: savedAdmin.email,
      },
    });
  } catch (error: any) {
    console.error("Signup Error:", error);
    // Handle MongoDB duplicate key errors gracefully
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const readableField: Record<string, string> = {
        email: "Email",
        employeeId: "Employee ID",
        username: "Full Name",
      };
      const label = readableField[field] || field;
      return NextResponse.json(
        { message: `${label} is already registered` },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
