import { type NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import { getSupabaseUser } from "@/lib/auth";
import type { Project, Module } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import { ObjectId } from "mongodb";

// --- Fix: Define the Upload interface locally ---
interface UploadDoc {
  _id: ObjectId;
  projectId: string;
  storagePath: string; // This fixes the specific error you saw
  user_id: string;
  fileName: string;
}

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type RouteProps = {
  params: Promise<{ id: string }>;
};

// --- GET (Preserved) ---
export async function GET(_req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await props.params;
    const projectsCollection = await getCollection<Project>("projects");

    const projectRaw = await projectsCollection.findOne({
      $or: [{ id: projectId }, { _id: projectId }],
    });

    if (!projectRaw) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const uploadsCollection = await getCollection("uploads");
    const projectUploads = await uploadsCollection
      .find({ projectId: projectId })
      .toArray();

    const normalized = {
      ...projectRaw,
      modules: projectRaw.modules || [],
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

// --- PATCH (Preserved) ---
export async function PATCH(req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

// --- DELETE (Updated & Fixed) ---
export async function DELETE(_req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await props.params;

    const projectsCollection = await getCollection<Project>("projects");

    // Fix: Add <UploadDoc> generic so TypeScript knows storagePath exists
    const uploadsCollection = await getCollection<UploadDoc>("uploads");

    // 1. Verify Project Ownership
    const project = await projectsCollection.findOne({
      $and: [
        { $or: [{ id: projectId }, { _id: projectId }] },
        { user_id: user.id },
      ],
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Find all files associated with this project
    const projectFiles = await uploadsCollection
      .find({ projectId: projectId })
      .toArray();

    // 3. Delete from Supabase Storage
    const storagePaths = projectFiles
      .map((file) => file.storagePath) // TypeScript is happy now!
      .filter((path) => typeof path === "string" && path.length > 0);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove(storagePaths);

      if (storageError) {
        console.error("Failed to cleanup Supabase files:", storageError);
      }
    }

    // 4. Delete file records from MongoDB
    await uploadsCollection.deleteMany({ projectId: projectId });

    // 5. Delete the Project
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
