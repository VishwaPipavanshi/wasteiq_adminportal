import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Worker from "@/models/WorkerModel";
import { getAdminFromToken } from "@/helpers/getAdminFromToken";

connect();

// GET /api/worker/[id] — Get a single worker's details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    getAdminFromToken(request);
    const { id } = await params;

    const worker = await Worker.findById(id).select(
      "-password -forgotPasswordOTP -forgotPasswordOTPExpiry"
    );
    if (!worker) {
      return NextResponse.json({ message: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, worker });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

// PUT /api/worker/[id] — Update worker info or toggle active status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    getAdminFromToken(request);
    const { id } = await params;
    const body = await request.json();

    const { firstName, middleName, lastName, mobile, address, zone, ward, isActive } = body;

    const worker = await Worker.findByIdAndUpdate(
      id,
      {
        ...(firstName !== undefined && { firstName }),
        ...(middleName !== undefined && { middleName }),
        ...(lastName !== undefined && { lastName }),
        ...(mobile !== undefined && { mobile }),
        ...(address !== undefined && { address }),
        ...(zone !== undefined && { zone }),
        ...(ward !== undefined && { ward }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    ).select("-password -forgotPasswordOTP -forgotPasswordOTPExpiry");

    if (!worker) {
      return NextResponse.json({ message: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, worker });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

// DELETE /api/worker/[id] — Permanently delete a worker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    getAdminFromToken(request);
    const { id } = await params;

    const worker = await Worker.findByIdAndDelete(id);
    if (!worker) {
      return NextResponse.json({ message: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Worker deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
