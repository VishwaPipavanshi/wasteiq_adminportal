import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
  id: string;
  email: string;
  username: string;
  type: "admin";
}

export const getAdminFromToken = (request: NextRequest): string => {
  try {
    const token = request.cookies.get("token")?.value || "";
    if (!token) throw new Error("No authentication token found. Please log in.");

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as AdminTokenPayload;

    if (decoded.type !== "admin") {
      throw new Error("Invalid token type. Admin access required.");
    }

    return decoded.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
