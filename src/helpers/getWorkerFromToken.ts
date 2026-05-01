import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface WorkerTokenPayload {
  id: string;
  email: string;
  type: "worker";
}

/**
 * Extracts the authenticated worker's ID from the request.
 * The Flutter worker app sends: Authorization: Bearer <token>
 */
export const getWorkerFromToken = (request: NextRequest): string => {
  try {
    let token = "";

    // Flutter app sends Bearer token in Authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) throw new Error("No authentication token found. Please log in.");

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as WorkerTokenPayload;

    if (decoded.type !== "worker") {
      throw new Error("Invalid token type.");
    }

    return decoded.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
