import { type NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import { getSupabaseUser } from "@/lib/auth";
import type { Project, Module } from "@/lib/types";

/**
 * GET /api/projects
 * Returns the authenticated user's projects (most recent first).
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectsCollection = await getCollection<Project>("projects");
    const projects = await projectsCollection
      .find({ user_id: user.id })
      .sort({ createdAt: -1 })
      .toArray();
    // Normalize projects so they always have an `id` field for the frontend.
    const normalized = projects.map((p: any) => ({
      ...p,
      id: p.id ?? p._id,
    }));

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Creates a new project for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, modules } = body as {
      title?: string;
      description?: string;
      modules?: Array<Partial<Module>>;
    };

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const projectsCollection = await getCollection<Project>("projects");

    const formattedModules: Module[] = (modules || []).map((m) => ({
      _id: m._id ?? crypto.randomUUID(),
      title: m.title?.trim() || "Untitled Module",
      completed: m.completed ?? false,
      notes: m.notes || "",
    }));

    const now = new Date();
    const stableId = crypto.randomUUID();

    const newProject: Project = {
      id: stableId,
      title: title.trim(),
      description: description.trim(),
      modules: formattedModules,
      createdAt: now,
      updatedAt: now,
      user_id: user.id,
    };

    await projectsCollection.insertOne(newProject);

    return NextResponse.json({ projectId: stableId }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
