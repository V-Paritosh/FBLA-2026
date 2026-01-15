import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

const XP_RATES = {
  lesson: 10,
  video: 10,
  quiz: 15,
  cheatsheet: 20,
};

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resourceId, type } = await req.json();

    const resourcesCollection = await getCollection("resources");
    const usersCollection = await getCollection("users");

    // Check if user already interacted
    const resource = await resourcesCollection.findOne({
      _id: new ObjectId(resourceId),
      interactedUsers: user.id,
    });

    if (resource) {
      return NextResponse.json(
        { message: "Already interacted" },
        { status: 200 }
      );
    }

    // Determine XP
    const xpAmount = XP_RATES[type as keyof typeof XP_RATES] || 10;

    // Execute updates in parallel
    await Promise.all([
      // 1. Add user to interacted list
      resourcesCollection.updateOne(
        { _id: new ObjectId(resourceId) },
        { $addToSet: { interactedUsers: user.id } }
      ),
      // 2. Award XP
      usersCollection.updateOne(
        { user_id: user.id },
        { $inc: { xp: xpAmount } }
      ),
    ]);

    return NextResponse.json(
      { success: true, xpAwarded: xpAmount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Interaction error:", error);
    return NextResponse.json({ error: "Interaction failed" }, { status: 500 });
  }
}
