import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/auth"
import { getCollection } from "@/lib/mongo"
import type { Session } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const sessionsCollection = await getCollection<Session>("sessions")
    const sessions = await sessionsCollection.find({}).sort({ date: -1 }).limit(50).toArray()

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Fetch sessions error:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, description, date } = await request.json()

    const sessionsCollection = await getCollection<Session>("sessions")

    const newSession: Session = {
      user_id: user.id,
      host_user_id: user.id,
      subject,
      description,
      date: new Date(date),
      createdAt: new Date(),
    }

    const result = await sessionsCollection.insertOne(newSession)

    return NextResponse.json({ success: true, sessionId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
