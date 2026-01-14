"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
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
              <span className="font-bold text-xl hidden sm:inline text-foreground">
                CodeNode
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
