"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useUIStore } from "@/store/ui-store"

export function Navbar() {

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">CS</span>
              </div>
              <span className="font-bold text-xl hidden sm:inline text-foreground">CS Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
