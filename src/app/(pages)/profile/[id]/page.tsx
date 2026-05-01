"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import {
  Mail,
  Shield,
  Phone,
  MapPin,
  Briefcase,
  LogOut,
  Hash,
} from "lucide-react";

interface Admin {
  username: string;
  email: string;
  avatar?: string | null;
  role: string;
  department: string;
  designation: string;
  mobile: string;
  employeeId: string;
  zone: string;
  ward: string;
  officeLocation: string;
}

export default function AdminProfile() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin>({
    username: "Loading...",
    email: "Loading...",
    avatar: null,
    role: "Loading...",
    department: "Loading...",
    designation: "Loading...",
    mobile: "",
    employeeId: "",
    zone: "",
    ward: "",
    officeLocation: "",
  });

  // Fetch admin data
  useEffect(() => {
    const getAdminDetails = async () => {
      try {
        const res = await axios.get("/api/admin/me");
        const user = res.data.data;

        if (!user) throw new Error("No user data found");

        setAdmin({
          username: user.username || "Admin User",
          email: user.email || "admin@gov.in",
          avatar: user.avatar || null,
          role: user.role || "System Administrator",
          department: user.department || "AI & Waste Management Division",
          designation: user.designation || "Chief Data Officer",
          mobile: user.mobile || "",
          employeeId: user.employeeId || "",
          zone: user.zone || "",
          ward: user.ward || "",
          officeLocation: user.officeLocation || "",
        });
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        toast.error("Failed to load profile");
      }
    };
    getAdminDetails();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out successfully!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      toast.error("Logout failed. Please try again.");
    }
  };

  // Get initials
  const getInitials = (name: string) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-300 flex items-center justify-center p-6">
      <Toaster position="top-right" />
      <div className="relative max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-green-400 to-emerald-400 rounded-t-3xl -z-10"></div>

        {/* Profile Header */}
        <div className="flex flex-col items-center pt-16 pb-8 px-6">
          {admin.avatar ? (
            <Image
              src={admin.avatar}
              alt="Admin Avatar"
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg object-cover"
              unoptimized
            />
          ) : (
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-green-600 text-white text-4xl font-bold shadow-lg border-4 border-white">
              {getInitials(admin.username)}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{admin.username}</h1>
          <p className="text-gray-700 mt-1">{admin.designation} – {admin.department}</p>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6 border-t border-gray-200">
          <InfoItem icon={<Mail className="w-5 h-5 text-green-600" />} label="Email" value={admin.email} />
          <InfoItem icon={<Shield className="w-5 h-5 text-green-600" />} label="Role" value={admin.role} />
          <InfoItem icon={<Phone className="w-5 h-5 text-green-600" />} label="Mobile" value={admin.mobile} />
          <InfoItem icon={<MapPin className="w-5 h-5 text-green-600" />} label="Office" value={admin.officeLocation} />
          <InfoItem icon={<Hash className="w-5 h-5 text-green-600" />} label="Employee ID" value={admin.employeeId} />
          <InfoItem icon={<MapPin className="w-5 h-5 text-green-600" />} label="Zone / Ward" value={`${admin.zone}, ${admin.ward}`} />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl shadow-md transition-all duration-300 font-medium"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Info item component
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-all duration-300">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
