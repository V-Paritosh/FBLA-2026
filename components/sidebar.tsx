"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Calendar,
  BookOpen,
  Settings,
  LogOut,
  X,
  BarChart3,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: BookOpen, label: "Resources", href: "/resources" },
    // { icon: BarChart3, label: "Metrics", href: "/metrics" },
    { icon: Settings, label: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-40 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-200 
          flex flex-col 
          h-[calc(100vh-4rem)] 
          lg:static lg:top-0 lg:h-screen lg:translate-x-0 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <button
            onClick={toggleSidebar}
            className="mb-6 rounded-lg p-2 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Fixed Bottom Section (Logout) */}
        <div className="border-t border-sidebar-border p-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
