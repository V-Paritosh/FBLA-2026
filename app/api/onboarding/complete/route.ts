import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/auth"
import { getCollection } from "@/lib/mongo"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { interests, experienceLevel, learningGoals } = await request.json()

    const usersCollection = await getCollection<User>("users")

    const result = await usersCollection.updateOne(
      { email: user.email! },
      {
        $set: {
          user_id: user.id,
          interests,
          experienceLevel,
          learningGoals,
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 })
  }
}
