const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function verifyFlow() {
    console.log("--- Starting E2E Verification ---");

    // 1. Submit a 'Suspicious' report (Low Mass)
    try {
        console.log("\n1. Submitting a report with LOW MASS (should be flagged)...");
        const resp1 = await axios.post(`${BASE_URL}/reports`, {
            user_id: "verify_123",
            username: "tester_pro",
            image_path: "mock_garbage_small.jpg",
            location: { lat: 23.0225, lng: 72.5714 },
            model_result: {
                total_mass: 0.02, // Below 0.05kg threshold
                coverage: 5,
                detections: [{ label: "Plastic", confidence: 0.8 }]
            }
        });
        console.log("Response:", resp1.data.report.status, "| Genuineness:", resp1.data.report.is_genuine);
    } catch (e) {
        console.error("Submission 1 failed (make sure dev server is running)");
    }

    // 2. Submit a 'Genuine' report
    try {
        console.log("\n2. Submitting a GENUINE report...");
        const resp2 = await axios.post(`${BASE_URL}/reports`, {
            user_id: "verify_456",
            username: "civic_hero",
            image_path: "mock_garbage_large.jpg",
            location: { lat: 23.0300, lng: 72.5800 },
            model_result: {
                total_mass: 1.5,
                coverage: 85,
                detections: [{ label: "Plastic", confidence: 0.9, mass: 1.5 }]
            }
        });
        console.log("Response:", resp2.data.report.status, "| Genuineness:", resp2.data.report.is_genuine);
    } catch (e) {
        console.error("Submission 2 failed");
    }

    console.log("\n--- Verification Script Complete ---");
}

verifyFlow();
