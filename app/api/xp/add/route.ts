import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import type { User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const admin = await getSupabaseUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, xpAmount, reason } = (await request.json()) as {
      userId?: string;
      xpAmount?: number;
      reason?: string;
    };

    if (!userId || typeof xpAmount !== "number" || !reason) {
      return NextResponse.json(
        { error: "userId, xpAmount, and reason are required" },
        { status: 400 }
      );
    }

    // Validate XP amount is positive and reasonable (max 1000 per action)
    if (xpAmount <= 0 || xpAmount > 1000) {
      return NextResponse.json(
        { error: "Invalid XP amount" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>("users");

    await usersCollection.updateOne(
      { user_id: userId },
      { $inc: { xp: xpAmount } }
    );

    return NextResponse.json(
      {
        success: true,
        xpAwarded: xpAmount,
        reason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error awarding XP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
