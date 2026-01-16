import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

// Configuration
const XP_RATES = {
  ADD_RESOURCE: 25,
};

// GET: Fetch resources with Author Name
export async function GET(req: NextRequest) {
  try {
    const resourcesCollection = await getCollection("resources");
    const user = await getSupabaseUser();

    // Aggregation pipeline to join 'users' collection
    const resources = await resourcesCollection
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "createdBy", // The ID stored in the resource
            foreignField: "user_id", // The ID in the users collection
            as: "authorDetails",
          },
        },
        {
          $unwind: {
            path: "$authorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            type: 1,
            category: 1,
            difficulty: 1,
            url: 1,
            createdAt: 1,
            createdBy: 1,
            interactedUsers: 1,
            // Extract just the name, fallback to "Unknown"
            authorName: { $ifNull: ["$authorDetails.name", "Unknown Student"] },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      resources,
      currentUserId: user?.id || null, // Send this so UI knows who owns what
    });
  } catch (error) {
    console.error("Fetch resources error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: Add Resource (+25 XP)
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

    const newResource = {
      title,
      type,
      category,
      difficulty: difficulty || "Beginner",
      url,
      createdBy: user.id,
      interactedUsers: [],
      createdAt: new Date(),
    };

    const result = await resourcesCollection.insertOne(newResource);

    // AWARD XP
    await usersCollection.updateOne(
      { user_id: user.id },
      { $inc: { xp: XP_RATES.ADD_RESOURCE } }
    );

    // Return the object with the user's ID so the UI updates immediately
    return NextResponse.json(
      {
        ...newResource,
        _id: result.insertedId,
        authorName: "You", // Optimistic UI update
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PUT: Edit Resource (Only Owner)
export async function PUT(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, type, category, difficulty, url } = await req.json();

    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const resourcesCollection = await getCollection("resources");

    const result = await resourcesCollection.updateOne(
      { _id: new ObjectId(id), createdBy: user.id }, // Security check: Must be owner
      {
        $set: {
          title,
          type,
          category,
          difficulty,
          url, // Optional: They might update the link
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Remove Resource (-25 XP)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");

    if (!user || !resourceId) {
      return NextResponse.json(
        { error: "Unauthorized or missing ID" },
        { status: 401 }
      );
    }

    const resourcesCollection = await getCollection("resources");
    const usersCollection = await getCollection("users");

    // 1. Delete the resource (Must be owner)
    const result = await resourcesCollection.deleteOne({
      _id: new ObjectId(resourceId),
      createdBy: user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 }
      );
    }

    // 2. Deduct XP (Reverse the reward)
    await usersCollection.updateOne(
      { user_id: user.id },
      { $inc: { xp: -XP_RATES.ADD_RESOURCE } }
    );

    return NextResponse.json({
      success: true,
      xpDeducted: XP_RATES.ADD_RESOURCE,
    });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
