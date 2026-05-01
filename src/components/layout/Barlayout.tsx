"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface BarLayoutProps {
  children: React.ReactNode;
}

export default function BarLayout({ children }: BarLayoutProps) {
  const pathname = usePathname(); // get current route
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("/AdminDashboard");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [mounted, setMounted] = useState(false); // track mount for client-side only

  const sidebarExpandedWidth = 256; // w-64
  const sidebarCollapsedWidth = 80; // w-20
  const sidebarWidth = isCollapsed ? sidebarCollapsedWidth : sidebarExpandedWidth;

  // Responsive handling
  useEffect(() => {
    setMounted(true); // only render after client mount
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync active page state with the current route to handle reloads/direct navigation
  useEffect(() => {
    if (pathname) {
      // Find the best match from menuItems or handle special cases
      const matchedPath = pathname.toLowerCase();
      if (matchedPath.includes("dashboard")) setActivePage("/AdminDashboard");
      else if (matchedPath.includes("moderation")) setActivePage("/AdminModeration");
      else if (matchedPath.includes("reports")) setActivePage("/AdminReports");
      else if (matchedPath.includes("worker")) setActivePage("/AdminWorker");
      else if (matchedPath.includes("users")) setActivePage("/AdminUsers");
      else if (matchedPath.includes("profile")) setActivePage("/profile");
    }
  }, [pathname]);

  // Auto collapse on small screens
  useEffect(() => {
    if (windowWidth < 768) setIsCollapsed(true);
    else setIsCollapsed(false);
  }, [windowWidth]);

  // Wait until mounted to avoid mismatch
  if (!mounted) return null;

  const normalizedPath = pathname?.toLowerCase() || "";

  // Hide sidebar on login/signup and root page
  const hideSidebar =
    normalizedPath === "/" ||
    normalizedPath === "/login" ||
    normalizedPath === "/signup";

  // Hide topbar on login/signup, root page, and profile pages
  const hideTopbar =
    normalizedPath === "/" ||
    normalizedPath === "/login" ||
    normalizedPath === "/signup" ||
    normalizedPath.startsWith("/profile");

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {!hideSidebar && (
        <AnimatePresence>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: sidebarWidth }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-screen z-40 bg-white shadow-lg overflow-hidden"
          >
            <Sidebar
              isCollapsed={isCollapsed}
              toggleCollapse={() => setIsCollapsed(!isCollapsed)}
              activePage={activePage}
              setActivePage={setActivePage}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {!hideTopbar && (
        <motion.div
          className="fixed top-0 right-0 z-30"
          animate={{
            left: hideSidebar ? 0 : sidebarWidth,
            width: `calc(100% - ${hideSidebar ? 0 : sidebarWidth}px)`,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        >
          <Topbar activePage={activePage} sidebarCollapsed={isCollapsed} />
        </motion.div>
      )}

      {/* Main Content */}
      <motion.main
        className={`flex-1 transition-all duration-300 ${!hideSidebar ? "mt-20" : ""}`}
        animate={{ marginLeft: hideSidebar ? 0 : sidebarWidth }}
      >
        {children}
      </motion.main>
    </div>
  );
}
