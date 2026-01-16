import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_SIZE_MB = 50;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const oldUrl = formData.get("oldUrl") as string | null; // <--- Capture old URL

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validation
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_SIZE_MB}MB` },
        { status: 413 }
      );
    }

    // 4. CLEANUP: Delete old file if updating
    if (oldUrl) {
      try {
        // Extract the path after 'resource-files/'
        // URL format: .../storage/v1/object/public/resource-files/SOME_PATH
        const path = oldUrl.split("/resource-files/")[1];
        if (path) {
          await supabase.storage.from("resource-files").remove([path]);
        }
      } catch (err) {
        console.warn("Failed to delete old file:", err);
        // We continue uploading even if delete fails
      }
    }

    // 5. Upload New File
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${user.id}/${uniqueSuffix}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resource-files")
      .upload(storagePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Storage upload failed" },
        { status: 500 }
      );
    }

    // 6. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("resource-files").getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
