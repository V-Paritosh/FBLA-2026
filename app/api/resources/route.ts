import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const collection = await getCollection("resources");
    // Sort by newest first
    const resources = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, type, category, difficulty, url } = body;

    if (!title || !type || !category || !url) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const resourcesCollection = await getCollection("resources");
    const usersCollection = await getCollection("users");

    // 1. Create Resource
    const newResource = {
      title,
      type, // 'lesson', 'video', 'quiz', 'cheatsheet'
      category,
      difficulty: difficulty || "Beginner",
      url, // The link or the supabase file URL
      createdBy: user.id,
      interactedUsers: [], // Tracks who has already clicked this
      createdAt: new Date(),
    };

    const result = await resourcesCollection.insertOne(newResource);

    // 2. Award XP for CREATING a resource (+25 XP)
    await usersCollection.updateOne({ user_id: user.id }, { $inc: { xp: 25 } });

    return NextResponse.json(
      { ...newResource, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
