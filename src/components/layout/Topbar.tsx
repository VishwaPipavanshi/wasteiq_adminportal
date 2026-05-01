"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { motion } from "framer-motion";

interface TopbarProps {
  activePage?: string; // e.g., "/AdminDashboard"
  sidebarCollapsed: boolean; // true/false
}

export default function Topbar({ activePage, sidebarCollapsed }: TopbarProps) {
  const [hasNotifications, setHasNotifications] = useState(false);

  // Map sidebar paths to display titles
  const pageTitles: Record<string, string> = {
    "/admindashboard": "Dashboard",
    "/adminworker": "Worker Management",
    "/adminreports": "Analytics & Reports",
    "/adminmoderation": "Moderation",
    "/adminusers": "User Management",
  };

  // Normalize activePage and get title
  const currentTitle =
    pageTitles[activePage?.toLowerCase() || "/admindashboard"] || "Admin Dashboard";

  // Compute sidebar width
  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <motion.div
      className="fixed top-0 z-50 bg-white backdrop-blur-md shadow-md border-b border-gray-200"
      animate={{
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        {/* Left - Dynamic Title */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-text text-transparent select-none">
            {currentTitle}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 relative max-w-full md:max-w-lg w-full">
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full py-2.5 pl-11 pr-4 rounded-full border border-gray-300 shadow-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all text-gray-700 placeholder:text-gray-400"
          />
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>

        {/* Right Section - Notifications */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative cursor-pointer group">
            <Bell className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
            )}

            <div className="absolute top-8 right-0 w-64 bg-white border border-gray-200 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
              <div className="p-3 text-sm text-gray-700 font-medium">
                {hasNotifications ? (
                  <p>You have new notifications</p>
                ) : (
                  <p>No new notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
