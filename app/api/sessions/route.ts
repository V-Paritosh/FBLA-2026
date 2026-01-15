import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import type { Session } from "@/lib/types";

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
            // We now return the list of user_ids who joined
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

// POST: Create a session
export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, description, date, location, meeting_link } =
      await request.json();
    const sessionsCollection = await getCollection<Session>("sessions");

    const newSession = {
      user_id: user.id,
      host_user_id: user.id,
      subject,
      description,
      date: new Date(date),
      location: location || "",
      meeting_link: meeting_link || "",
      attendee_ids: [], // Start with empty attendees
      createdAt: new Date(),
    };

    const result = await sessionsCollection.insertOne(newSession as any);
    return NextResponse.json(
      { success: true, sessionId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// PUT: Edit a session (Only Host)
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

    // Update only if the _id matches AND the host is the current user
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

// PATCH: Join or Leave a Session
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId, action } = await request.json(); // action = 'join' or 'leave'
    const sessionsCollection = await getCollection<Session>("sessions");

    let updateOperation;

    if (action === "join") {
      // Add user ID to array if not exists
      updateOperation = { $addToSet: { attendee_ids: user.id } };
    } else {
      // Remove user ID from array
      updateOperation = { $pull: { attendee_ids: user.id } as any };
    }

    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      updateOperation
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Join/Leave error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a session
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSupabaseUser();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessionsCollection = await getCollection<Session>("sessions");
    const result = await sessionsCollection.deleteOne({
      _id: new ObjectId(sessionId!),
      host_user_id: user.id,
    });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Error" }, { status: 404 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
