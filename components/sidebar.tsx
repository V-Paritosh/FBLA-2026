"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, Calendar, BookOpen, Settings, LogOut } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

// Import from your central auth file
import { getSession, signOut } from "@/lib/auth-client";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();

  // 1. Check Session on Mount
  useEffect(() => {
    const checkUser = async () => {
      const { session, error } = await getSession();
      // If no session or error, force redirect to landing
      if (error || !session) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  // 2. Updated Logout Logic
  const handleLogout = async () => {
    try {
      await signOut();

      // Close sidebar if on mobile
      if (window.innerWidth < 1024 && isSidebarOpen) {
        toggleSidebar();
      }

      // FIX: Use window.location.href instead of router.push
      // This forces a hard refresh to clear client cache and state
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: BookOpen, label: "Resources", href: "/resources" },
    { icon: Settings, label: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)]
          border-r border-sidebar-border bg-sidebar 
          transform transition-transform duration-200 ease-in-out
          flex flex-col 
          lg:static lg:h-screen lg:translate-x-0 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isSidebarOpen && toggleSidebar()}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

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
