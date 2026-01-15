import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import { createClient } from "@supabase/supabase-js";
import { ObjectId } from "mongodb";

// 1. Define the shape of your Upload document
interface UploadDocument {
  _id: ObjectId;
  user_id: string;
  storagePath: string;
  projectId: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: uploadId } = await props.params;

    // 2. Pass the interface to getCollection so TypeScript knows the structure
    const uploadsCollection = await getCollection<UploadDocument>("uploads");

    const fileDoc = await uploadsCollection.findOne({
      _id: new ObjectId(uploadId),
    });

    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 3. Now TypeScript knows 'user_id' exists on fileDoc
    if (fileDoc.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from Supabase Storage
    // TypeScript also knows 'storagePath' exists now
    if (fileDoc.storagePath) {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove([fileDoc.storagePath]);

      if (storageError) {
        console.error("Supabase storage delete error:", storageError);
      }
    }

    // Delete from MongoDB
    await uploadsCollection.deleteOne({ _id: new ObjectId(uploadId) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
