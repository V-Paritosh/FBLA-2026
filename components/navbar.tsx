"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import logo from "@/public/logo.png";

export function Navbar() {
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();

  // Define all paths where the sidebar menu should NOT appear
  const hideMenuOnPaths = ["/", "/login", "/signup"];

  // Check if the current path is in the list
  const showMobileMenu = !hideMenuOnPaths.includes(pathname);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {showMobileMenu && (
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 -ml-2 text-foreground hover:bg-accent rounded-md"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image
                  src={logo}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl sm:inline text-foreground">
                CodeNode
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
