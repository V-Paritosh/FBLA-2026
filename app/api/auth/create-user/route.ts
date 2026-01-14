import { type NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import type { User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Receive firstName, lastName, and userId
    const { email, firstName, lastName, userId } = await request.json();

    if (!email || !firstName || !lastName || !userId) {
      return NextResponse.json(
        { error: "Email, names, and userId are required" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 2. Combine names and use the real Supabase ID
    const newUser: User = {
      email,
      name: `${firstName} ${lastName}`.trim(), // Combine inputs
      user_id: userId, // Store the Link to Supabase Auth!
      interests: [],
      experienceLevel: "beginner",
      learningGoals: [],
      streak: 0,
      xp: 0,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json(
      { success: true, userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
