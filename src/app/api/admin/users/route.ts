import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Report from "@/models/reportModel";
import Shift from "@/models/shiftModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
    try {
        
        const users = await User.find();

        // Enhance with report counts and shift activity
        const userStats = await Promise.all(
            users.map(async (user) => {
                const userId = user.user_id;
                const reportCount = await Report.countDocuments({ user_id: userId });
                const verifiedCount = await Report.countDocuments({ 
                    user_id: userId, 
                    status: "completed",
                });

                // Latest shift for activity tracking
                const latestShift = await Shift.findOne({ user_id: userId }).sort({ createdAt: -1 });
                
                return {
                    ...user.toObject(),
                    reportCount,
                    verifiedCount,
                    isOnline: latestShift?.status === "active",
                    lastActive: latestShift?.end_time || latestShift?.start_time || user.updatedAt
                };
            })
        );

        return NextResponse.json({
            success: true,
            users: userStats
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
