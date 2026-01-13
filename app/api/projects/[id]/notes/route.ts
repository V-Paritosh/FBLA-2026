import { type NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import { getSupabaseUser } from "@/lib/auth";
import type { Project } from "@/lib/types";

interface PatchBody {
  moduleIndex: number;
  notes: string;
}

// Correct Type
type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Await params
    const { id: projectId } = await props.params;

    const projectsCollection = await getCollection<Project>("projects");
    const project = await projectsCollection.findOne({
      $or: [{ id: projectId }, { _id: projectId }],
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = (await req.json()) as PatchBody;
    const { moduleIndex, notes } = body;

    if (
      typeof moduleIndex !== "number" ||
      Number.isNaN(moduleIndex) ||
      moduleIndex < 0 ||
      typeof notes !== "string"
    ) {
      return NextResponse.json(
        { error: "Valid moduleIndex (>= 0) and notes are required" },
        { status: 400 }
      );
    }

    const updateResult = await projectsCollection.updateOne(
      { $or: [{ id: projectId }, { _id: projectId }] },
      {
        $set: {
          [`modules.${moduleIndex}.notes`]: notes,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update module notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
