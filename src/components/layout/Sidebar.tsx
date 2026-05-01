"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  FileText,
  AlertCircle,
  LogOut,
  Leaf,
  BarChart3,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  activePage: string; // shared from BarLayout
  setActivePage: (path: string) => void; // shared setter
}

const menuItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    path: "/AdminDashboard",
    gradient: "from-green-400 to-green-600",
  },
  {
    name: "Moderation",
    icon: AlertCircle,
    path: "/AdminModeration",
    gradient: "from-yellow-400 to-yellow-500",
  },
  {
    name: "Reports",
    icon: FileText,
    path: "/AdminReports",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    name: "Worker",
    icon: UserCheck,
    path: "/AdminWorker",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    name: "Users",
    icon: Users,
    path: "/AdminUsers",
    gradient: "from-pink-400 to-pink-600",
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalCollapsed,
  toggleCollapse,
  activePage,
  setActivePage,
}) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(externalCollapsed ?? false);
  const [adminName, setAdminName] = useState("Loading...");
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Sync external collapsed state
  useEffect(() => {
    if (externalCollapsed !== undefined) setCollapsed(externalCollapsed);
  }, [externalCollapsed]);

  // Fetch admin data
  useEffect(() => {
    const getAdminDetails = async () => {
      try {
        const res = await axios.get("/api/admin/me");
        const user = res.data.data;
        setAdminName(user?.username || "Admin User");
        setAdminAvatar(user?.avatar || null);
        setAdminId(user?._id || null);
      } catch {
        setAdminName("Admin User");
      }
    };
    getAdminDetails();
  }, []);

  const handleNavigation = (path: string) => {
    setActivePage(path); // update BarLayout and Topbar
    router.push(path);
  };

  const handleProfileClick = () => {
    if (adminId) router.push(`/profile/${adminId}`);
    else router.push("/profile");
  };

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out successfully!");
      setTimeout(() => router.push("/login"), 1000);
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <motion.div
      className="h-screen bg-white text-gray-800 flex flex-col justify-between shadow-lg border-r border-gray-200 overflow-hidden"
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
    >
      <Toaster position="top-right" />

      {/* Logo & Collapse Button */}
      <div className="px-4 py-6 flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setCollapsed(!collapsed);
              toggleCollapse?.();
            }}
          >
            <Leaf
              className={`w-8 h-8 text-green-600 transition-transform duration-300 ${collapsed ? "rotate-0" : "rotate-12"
                }`}
            />
            {!collapsed && (
              <h1 className="text-2xl font-bold tracking-wide text-gray-800">
                Waste-IQ
              </h1>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => {
                setCollapsed(true);
                toggleCollapse?.();
              }}
              className="p-1 rounded hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.path;

            const buttonContent = (
              <motion.button
              ref={null}
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                    : "hover:bg-gray-100"
                  }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`}
                />
                {!collapsed && item.name}
              </motion.button>
            );

            return collapsed ? (
              <Tippy key={item.name} content={item.name} placement="right">
                {buttonContent}
              </Tippy>
            ) : (
              buttonContent
            );
          })}
        </nav>
      </div>

      {/* Admin Info & Logout */}
      <div className="px-4 py-6 border-t border-gray-200 flex flex-col items-center">
        <div
          className="flex items-center gap-3 mb-4 cursor-pointer hover:scale-[1.03] transition-transform duration-300"
          onClick={handleProfileClick}
        >
          {adminAvatar ? (
            <Image
              src={adminAvatar}
              alt={adminName}
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-gray-300 shadow-sm"
              unoptimized
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white font-bold border-2 border-gray-300 shadow-sm">
              {getInitials(adminName)}
            </div>
          )}
          {!collapsed && (
            <span className="font-semibold text-gray-800">{adminName}</span>
          )}
        </div>

        <motion.button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-4 py-2 w-full rounded-lg shadow-sm font-medium text-red-600 transition-all duration-300 ${collapsed ? "justify-center bg-red-100 hover:bg-red-200" : "bg-red-100 hover:bg-red-200"
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Logout"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
