import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/auth"
import { getCollection } from "@/lib/mongo"

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string

    if (!file || !projectId) {
      return NextResponse.json({ error: "File and projectId are required" }, { status: 400 })
    }

    // Store upload metadata in MongoDB
    const uploadsCollection = await getCollection("uploads")

    const uploadDoc = {
      user_id: user.id,
      projectId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
    }

    const result = await uploadsCollection.insertOne(uploadDoc)

    return NextResponse.json({ success: true, uploadId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
