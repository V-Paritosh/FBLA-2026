import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_SIZE_MB = 10; // 10MB limit for resources

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate User
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse File
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validation (PDF only for cheatsheets)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed for resources" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File exceeds the ${MAX_SIZE_MB}MB limit` },
        { status: 413 }
      );
    }

    // 4. Upload to Supabase (New Bucket: 'resource-files')
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

    // Path: user_id/filename.pdf
    const storagePath = `${user.id}/${uniqueSuffix}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resource-files") // Make sure you created this bucket in Supabase!
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

    // 5. Get Public URL
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
