import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { getCollection } from "@/lib/mongo";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate User
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // LIMIT CHECK
    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds the ${MAX_SIZE_MB}MB limit` },
        { status: 413 } // 413 = Payload Too Large
      );
    }

    // 3. Upload to Supabase Storage
    // Create a unique path: user_id/timestamp-filename
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${user.id}/${uniqueSuffix}-${sanitizedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("project-files")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Storage upload failed" },
        { status: 500 }
      );
    }

    // 4. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-files").getPublicUrl(storagePath);

    // 5. Insert into MongoDB
    const uploadsCollection = await getCollection("uploads");

    const newFileDoc = {
      user_id: user.id,
      projectId,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: publicUrl,
      storagePath: storagePath, // We save this so we can delete it later
      createdAt: new Date(),
    };

    const result = await uploadsCollection.insertOne(newFileDoc);

    // 6. Return the Full Object (Crucial for UI auto-refresh)
    return NextResponse.json(
      {
        _id: result.insertedId,
        ...newFileDoc,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
