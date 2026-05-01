import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import Worker from "@/models/WorkerModel";
import Shift from "@/models/shiftModel";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromToken } from "@/helpers/getAdminFromToken";

connect();

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate Admin
        getAdminFromToken(request);

        // 2. Fetch all reports with location data
        const reports = await Report.find({}, "location status username image_path timestamp _id");

        // 3. Fetch active workers (those with an active shift)
        const activeShifts = await Shift.find({ status: "active" }, "user_id");
        const activeWorkerIds = activeShifts.map(s => s.user_id);

        const activeWorkers = await Worker.find({ 
            _id: { $in: activeWorkerIds } 
        }, "firstName lastName zone ward _id");

        // 4. Mock locations for workers if they don't have them
        // We'll spread them around the centroid of reports or a default city center
        const defaultCenter = { lat: 21.1702, lng: 72.8311 }; // Example: Surat, India
        
        let center = defaultCenter;
        if (reports.length > 0) {
            const sumLat = reports.reduce((acc, r) => acc + r.location.lat, 0);
            const sumLng = reports.reduce((acc, r) => acc + r.location.lng, 0);
            center = {
                lat: sumLat / reports.length,
                lng: sumLng / reports.length
            };
        }

        const workersWithLocation = activeWorkers.map((worker, index) => {
            // Generate a small jitter around the center for visualization
            const jitterLat = (Math.random() - 0.5) * 0.02;
            const jitterLng = (Math.random() - 0.5) * 0.02;
            
            return {
                ...worker.toObject(),
                location: {
                    lat: center.lat + jitterLat,
                    lng: center.lng + jitterLng
                }
            };
        });

        return NextResponse.json({
            success: true,
            reports,
            workers: workersWithLocation,
            center
        });

    } catch (error: any) {
        console.error("Map Data API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
