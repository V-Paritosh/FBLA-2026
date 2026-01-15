import { type NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import { getSupabaseUser } from "@/lib/auth";
import type { Project, Module } from "@/lib/types";

// Correct Type: params is a Promise that resolves to an object containing id
type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await props.params;
    const projectsCollection = await getCollection<Project>("projects");

    // 1. Fetch the Project
    const projectRaw = await projectsCollection.findOne({
      $or: [{ id: projectId }, { _id: projectId }],
    });

    if (!projectRaw) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Fetch the Uploads for this Project (NEW CODE)
    const uploadsCollection = await getCollection("uploads");
    // We search for uploads where projectId matches the current ID
    const projectUploads = await uploadsCollection
      .find({ projectId: projectId })
      .toArray();

    // 3. Combine them
    const normalized = {
      ...projectRaw,
      modules: projectRaw.modules || [],
      // Attach the uploads to the response
      uploads: projectUploads || [],
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { modules } = body as { modules?: Array<Partial<Module>> };

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { error: "Modules array is required" },
        { status: 400 }
      );
    }

    const formattedModules: Module[] = modules.map((m) => ({
      _id: m._id ?? crypto.randomUUID(),
      title: m.title?.trim() || "Untitled Module",
      completed: m.completed ?? false,
      notes: m.notes || "",
    }));

    await projectsCollection.updateOne(
      { $or: [{ id: projectId }, { _id: projectId }] },
      { $set: { modules: formattedModules, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Await params
    const { id: projectId } = await props.params;

    const projectsCollection = await getCollection<Project>("projects");
    const deleteResult = await projectsCollection.deleteOne({
      $or: [{ id: projectId }, { _id: projectId }],
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
