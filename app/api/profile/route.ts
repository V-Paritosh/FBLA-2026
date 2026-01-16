import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import type { User } from "@/lib/types";

// Helper to split a full name if firstName/lastName are missing (Legacy support)
function splitName(fullName: string = "") {
  const parts = fullName.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

// 1. GET: Fetch the user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = await getCollection<User>("users");
    const userData = await usersCollection.findOne({ email: user.email! });

    // Handle legacy "name" field if firstName/lastName don't exist yet
    let finalFirstName = userData?.firstName;
    let finalLastName = userData?.lastName;

    if (!finalFirstName && !finalLastName && userData?.name) {
      const split = splitName(userData.name);
      finalFirstName = split.firstName;
      finalLastName = split.lastName;
    }

    return NextResponse.json({
      firstName: finalFirstName || "Student",
      lastName: finalLastName || "",
      email: user.email,
      joinedDate: userData?.createdAt
        ? new Date(userData.createdAt).toLocaleDateString()
        : "Recently",
      xp: userData?.xp || 0,
      streak: userData?.streak || 0,
      completedModules: 0,
      interests: userData?.interests || [],
      experienceLevel: userData?.experienceLevel || "beginner",
      learningGoals: userData?.learningGoals || [],
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// 2. PATCH: Update the user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      firstName,
      lastName,
      interests,
      experienceLevel,
      learningGoals,
    }: {
      firstName?: string;
      lastName?: string;
      interests?: string[];
      experienceLevel?: User["experienceLevel"];
      learningGoals?: string[];
    } = await request.json();

    const usersCollection = await getCollection<User>("users");

    // Construct update object
    const updateFields: any = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    // Keep 'name' synced as a full string for backward compatibility/easier display elsewhere
    if (firstName !== undefined || lastName !== undefined) {
      // We need to fetch current values if only one is being updated,
      // but for simplicity, we usually expect both or just overwrite the full name field.
      // Let's just update the full 'name' field combining the new values.
      // NOTE: Ideally, you just stop using 'name' and use first/last everywhere.
      // For now, we update the specific fields.
    }

    if (interests) updateFields.interests = interests;
    if (experienceLevel) updateFields.experienceLevel = experienceLevel;
    if (learningGoals) updateFields.learningGoals = learningGoals;

    await usersCollection.updateOne(
      { email: user.email! },
      { $set: updateFields }
    );

    const updatedUser = await usersCollection.findOne({ email: user.email! });

    return NextResponse.json(
      {
        firstName: updatedUser?.firstName ?? firstName ?? "Student",
        lastName: updatedUser?.lastName ?? lastName ?? "",
        email: user.email,
        joinedDate: updatedUser?.createdAt
          ? new Date(updatedUser.createdAt).toLocaleDateString()
          : "Recently",
        xp: updatedUser?.xp ?? 0,
        streak: updatedUser?.streak ?? 0,
        completedModules: 0,
        interests: updatedUser?.interests ?? [],
        experienceLevel: updatedUser?.experienceLevel ?? "beginner",
        learningGoals: updatedUser?.learningGoals ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
