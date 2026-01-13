import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/auth"
import { getCollection } from "@/lib/mongo"
import type { User, Project } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usersCollection = await getCollection<User>("users")
    const projectsCollection = await getCollection<Project>("projects")

    const userData = await usersCollection.findOne({ email: user.email! })
    const userProjects = await projectsCollection.find({ user_id: user.id }).limit(6).toArray()

    return NextResponse.json({
      userName: userData?.name || "Student",
      completionPercentage: Math.round(Math.random() * 100), // Placeholder
      streak: userData?.streak || 0,
      xp: userData?.xp || 0,
      projects: userProjects,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 })
  }
}
