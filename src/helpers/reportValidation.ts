import { NextRequest } from "next/server";

export function validateReport(model_result: any) {
    let is_genuine = true;
    let flagged_reason = "";
    let status = "pending";

    const mass =
        model_result?.sustainability_summary?.total_estimated_weight_kg ??
        0;


    const severity =
        model_result?.sustainability_summary?.severity?.toLowerCase() || "low";

    // 🚨 STRONG CONDITIONS
    if (!model_result || model_result?.error) {
        is_genuine = false;
        flagged_reason = "Model failed or returned no data";
        status = "flagged";
    }
    else if (mass <= 0) {
        is_genuine = false;
        flagged_reason = "Garbage amount too low";
        status = "flagged";
    }
    return { is_genuine, flagged_reason, status };
}