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

    // Placeholder user data - replace with MongoDB query.
    const users = [
      {
        _id: "user1",
        email: "student1@codenode.dev",
        name: "Alex Chen",
        isAdmin: false,
        createdAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalXP: 2500,
      },
      {
        _id: "user2",
        email: "student2@codenode.dev",
        name: "Jordan Smith",
        isAdmin: false,
        createdAt: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalXP: 1800,
      },
      {
        _id: "user3",
        email: "mentor@codenode.dev",
        name: "Casey Rodriguez",
        isAdmin: true,
        createdAt: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalXP: 5000,
      },
    ];

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
