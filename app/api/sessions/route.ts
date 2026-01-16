import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import type { Session } from "@/lib/types";

// --- XP Configuration ---
const XP_RATES = {
  HOSTING: 50, // XP for creating a session
  JOINING: 20, // XP for attending a session
};

// GET: Fetch sessions
export async function GET(request: NextRequest) {
  try {
    const sessionsCollection = await getCollection<Session>("sessions");

    const sessions = await sessionsCollection
      .aggregate([
        { $sort: { date: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: "users",
            localField: "host_user_id",
            foreignField: "user_id",
            as: "hostDetails",
          },
        },
        {
          $unwind: {
            path: "$hostDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            subject: 1,
            description: 1,
            date: 1,
            host_user_id: 1,
            location: 1,
            meeting_link: 1,
            attendee_ids: { $ifNull: ["$attendee_ids", []] },
            hostName: { $ifNull: ["$hostDetails.name", "Unknown"] },
          },
        },
      ])
      .toArray();

    const user = await getSupabaseUser();

    return NextResponse.json({
      sessions,
      currentUserId: user?.id || null,
    });
  } catch (error) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST: Create a session (Awards XP)
export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, description, date, location, meeting_link } =
      await request.json();

    const sessionsCollection = await getCollection<Session>("sessions");
    const usersCollection = await getCollection("users");

    const newSession = {
      user_id: user.id,
      host_user_id: user.id,
      subject,
      description,
      date: new Date(date),
      location: location || "",
      meeting_link: meeting_link || "",
      attendee_ids: [],
      createdAt: new Date(),
    };

    const result = await sessionsCollection.insertOne(newSession as any);

    // --- AWARD XP FOR HOSTING ---
    await usersCollection.updateOne(
      { user_id: user.id },
      { $inc: { xp: XP_RATES.HOSTING } }
    );

    return NextResponse.json(
      {
        success: true,
        sessionId: result.insertedId,
        xpAwarded: XP_RATES.HOSTING,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// PUT: Edit a session
export async function PUT(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, subject, description, date, location, meeting_link } =
      await request.json();

    if (!id)
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );

    const sessionsCollection = await getCollection<Session>("sessions");

    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(id), host_user_id: user.id },
      {
        $set: {
          subject,
          description,
          date: new Date(date),
          location,
          meeting_link,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Session not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// PATCH: Join or Leave (Awards or Deducts XP)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId, action } = await request.json();
    const sessionsCollection = await getCollection<Session>("sessions");
    const usersCollection = await getCollection("users");

    const currentSession = await sessionsCollection.findOne({
      _id: new ObjectId(sessionId),
      attendee_ids: user.id,
    });

    if (action === "join") {
      if (currentSession)
        return NextResponse.json({ message: "Already joined" });

      await Promise.all([
        sessionsCollection.updateOne(
          { _id: new ObjectId(sessionId) },
          { $addToSet: { attendee_ids: user.id } }
        ),
        usersCollection.updateOne(
          { user_id: user.id },
          { $inc: { xp: XP_RATES.JOINING } }
        ),
      ]);

      return NextResponse.json({ success: true, xpAwarded: XP_RATES.JOINING });
    } else {
      if (!currentSession) return NextResponse.json({ message: "Not joined" });

      await Promise.all([
        sessionsCollection.updateOne(
          { _id: new ObjectId(sessionId) },
          { $pull: { attendee_ids: user.id } as any }
        ),
        // DEDUCT XP ON LEAVE
        usersCollection.updateOne(
          { user_id: user.id },
          { $inc: { xp: -XP_RATES.JOINING } }
        ),
      ]);

      return NextResponse.json({ success: true, xpDeducted: XP_RATES.JOINING });
    }
  } catch (error) {
    console.error("Join/Leave error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a session (Deducts XP from Host)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessionsCollection = await getCollection<Session>("sessions");
    const usersCollection = await getCollection("users");

    // 1. Delete the session
    const result = await sessionsCollection.deleteOne({
      _id: new ObjectId(sessionId!),
      host_user_id: user.id,
    });

    if (result.deletedCount === 0)
      return NextResponse.json(
        { error: "Error or Unauthorized" },
        { status: 404 }
      );

    // 2. Deduct XP from the host for cancelling
    await usersCollection.updateOne(
      { user_id: user.id },
      { $inc: { xp: -XP_RATES.HOSTING } }
    );

    return NextResponse.json(
      {
        success: true,
        xpDeducted: XP_RATES.HOSTING,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
