import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";

function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) =>
    e.trim()
  ) ?? ["admin@codenode.dev"];
  return !!email && adminEmails.includes(email);
}

export async function GET(_req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mock data - replace with actual database queries.
    const stats = {
      totalUsers: 342,
      activeSessions: 12,
      totalLessons: 48,
      totalXPAwarded: 125_480,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
