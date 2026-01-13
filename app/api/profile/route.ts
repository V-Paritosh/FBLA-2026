import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/auth"
import { getCollection } from "@/lib/mongo"
import type { User } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usersCollection = await getCollection<User>("users")
    const userData = await usersCollection.findOne({ email: user.email! })

    return NextResponse.json({
      name: userData?.name || "Student",
      email: user.email,
      joinedDate: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Recently",
      xp: userData?.xp || 0,
      streak: userData?.streak || 0,
      completedModules: 0, // Placeholder
    })
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
