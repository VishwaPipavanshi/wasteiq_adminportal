"use client";
import axios from "axios";
// import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import toast from "react-hot-toast";
import { useState } from "react";
import React from "react";
import { Toaster, toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState("nothing")
  const Logout = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out successfully!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error("Logout failed. Please try again.");
    }
  };
  const getUserDetails = async () => {
    const res = await axios.get('/api/admin/me')
    console.log(res.data);
    setData(res.data.data._id)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-emerald-200 to-green-300">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          Admin Profile
        </h1>

        <div className="text-gray-700 mb-8">
          <p className="text-lg">
            Welcome, <span className="font-semibold text-green-700">Admin</span> 👋
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You are logged in to the{" "}
            <span className="font-medium text-green-700">
              Garbage Detection & Classification
            </span>{" "}
            system.
          </p>
        </div>

        <button
          onClick={Logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-red-300 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6A2.25 2.25 0 005.25 5.25v13.5a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25V15M18 12H9m9 0l-3-3m3 3l-3 3"
            />
          </svg>
          Logout
        </button>
        <button
          onClick={getUserDetails}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-green-300 transition-all duration-300"
        >
          Get User Data
        </button>
        <p className="text-gray-700 mt-4">
          {data === 'nothing' ? "Nothing" : <Link
            href={`/profile/${data}`}>{data}
          </Link>}
        </p>
      </div>
    </div>
  );
}
