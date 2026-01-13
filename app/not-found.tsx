import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h1 className="text-7xl font-bold text-foreground">404</h1>
          <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This page got lost in the matrix. Let's get you back on track.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </main>
    </>
  )
}
