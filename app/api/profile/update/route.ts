import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import type { User } from "@/lib/types";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      interests,
      experienceLevel,
      learningGoals,
    }: {
      interests?: string[];
      experienceLevel?: User["experienceLevel"];
      learningGoals?: string[];
    } = await request.json();

    const usersCollection = await getCollection<User>("users");

    await usersCollection.updateOne(
      { email: user.email! },
      {
        $set: {
          ...(interests ? { interests } : {}),
          ...(experienceLevel ? { experienceLevel } : {}),
          ...(learningGoals ? { learningGoals } : {}),
        },
      }
    );

    const updatedUser = await usersCollection.findOne({ email: user.email! });

    return NextResponse.json(
      {
        name: updatedUser?.name ?? "Student",
        email: user.email,
        joinedDate: updatedUser?.createdAt
          ? new Date(updatedUser.createdAt).toLocaleDateString()
          : "Recently",
        xp: updatedUser?.xp ?? 0,
        streak: updatedUser?.streak ?? 0,
        completedModules: 0, // still a placeholder without module-completion tracking
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
