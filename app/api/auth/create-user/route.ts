import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongo"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const usersCollection = await getCollection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create new user profile
    const newUser: User = {
      email,
      name,
      user_id: "", // Will be set after Supabase auth
      interests: [],
      experienceLevel: "beginner",
      learningGoals: [],
      streak: 0,
      xp: 0,
      createdAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json({ success: true, userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
