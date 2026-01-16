import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import type { User } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Use the helper to get the collection (handles connection automatically)
    const usersCollection = await getCollection<User>("users");

    // 1. Get current user
    const user = await usersCollection.findOne({ user_id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Date Logic (Compare Midnights to avoid hour-drift issues)
    const now = new Date();
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    // Parse last login from DB
    const lastLoginRaw = user.lastLoginDate
      ? new Date(user.lastLoginDate)
      : null;
    const lastLoginMidnight = lastLoginRaw ? new Date(lastLoginRaw) : null;
    if (lastLoginMidnight) lastLoginMidnight.setHours(0, 0, 0, 0);

    let newStreak = user.streak || 0;
    let message = "Welcome back!";
    let type = "info";

    // 3. Determine Streak Status
    const oneDayMs = 1000 * 60 * 60 * 24;

    if (!lastLoginMidnight) {
      // First time login logic (if not set on signup)
      newStreak = 1;
      message = "First day streak started!";
      type = "success";
    } else {
      const diffTime = todayMidnight.getTime() - lastLoginMidnight.getTime();

      if (diffTime === 0) {
        // A. Logged in again on the SAME day
        // Do nothing to streak, keep it as is
        message = "Streak active. Keep it up!";
        type = "info";
      } else if (diffTime === oneDayMs) {
        // B. Logged in on the NEXT day (Consecutive)
        newStreak += 1;
        message = `Streak increased! You are on day ${newStreak}.`;
        type = "success";
      } else {
        // C. Missed a day (or more)
        newStreak = 1;
        message = "Streak reset. Start a new run today!";
        type = "info";
      }
    }

    // 4. Update MongoDB
    await usersCollection.updateOne(
      { user_id: userId },
      {
        $set: {
          streak: newStreak,
          lastLoginDate: now, // Save exact time for records
        },
      }
    );

    return NextResponse.json({ streak: newStreak, message, type });
  } catch (error: any) {
    console.error("Streak Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
