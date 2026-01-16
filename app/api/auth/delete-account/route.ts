import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongo";

function env(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 1. Verify User using Server-Side Cookies
    const supabase = createServerClient(
      env(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
      env(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      ),
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Could not verify identity. Please log in again." },
        { status: 401 }
      );
    }

    // 2. Delete ALL user data from MongoDB
    try {
      const { db } = await connectToDatabase();
      const userId = user.id; // The Supabase UUID (e.g., "ad4e7b07...")

      console.log(`Starting full account wipe for user_id: ${userId}`);

      // --- DELETE FROM ALL COLLECTIONS ---

      // 1. Users (Main Profile)
      const usersResult = await db.collection("users").deleteOne({
        $or: [{ user_id: userId }, { email: user.email }],
      });

      // 2. Sessions (Field: host_user_id)
      const sessionsResult = await db.collection("sessions").deleteMany({
        host_user_id: userId,
      });

      // 3. Projects (Field: user_id)
      const projectsResult = await db.collection("projects").deleteMany({
        user_id: userId,
      });

      // 4. Resources (Field: user_id)
      const resourcesResult = await db.collection("resources").deleteMany({
        user_id: userId,
      });

      // 5. Uploads (Field: user_id)
      const uploadsResult = await db.collection("uploads").deleteMany({
        user_id: userId,
      });

      console.log("--- Deletion Report ---");
      console.log(`Users: ${usersResult.deletedCount}`);
      console.log(`Sessions: ${sessionsResult.deletedCount}`);
      console.log(`Projects: ${projectsResult.deletedCount}`);
      console.log(`Resources: ${resourcesResult.deletedCount}`);
      console.log(`Uploads: ${uploadsResult.deletedCount}`);
    } catch (mongoError) {
      console.error("MongoDB Delete Error:", mongoError);
      return NextResponse.json(
        { error: "Database cleanup failed. Partial data may remain." },
        { status: 500 }
      );
    }

    // 3. Delete user from Supabase Auth (The final step)
    const adminSupabase = createServerClient(
      env(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
      env(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    );

    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Supabase Auth Delete Error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete authentication record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("General Delete Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
