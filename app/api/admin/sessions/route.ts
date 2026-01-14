import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";

/**
 * Basic guard to restrict this route to "admin" users based on email allow-list.
 * In a real app you'd back this with a DB role/claim.
 */
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

    // Still mock data, but now behind auth.
    const sessions = [
      {
        _id: "1",
        subject: "Web Development Fundamentals",
        description: "Learn HTML, CSS, and basic JavaScript",
        host_user_id: "admin",
        date: new Date(Date.now() + 86400000).toISOString(),
        attendees: 24,
        status: "active",
      },
      {
        _id: "2",
        subject: "Advanced Python Programming",
        description: "Deep dive into Python data structures and algorithms",
        host_user_id: "admin",
        date: new Date(Date.now() + 172800000).toISOString(),
        attendees: 18,
        status: "active",
      },
      {
        _id: "3",
        subject: "Database Design Basics",
        description: "SQL and relational database concepts",
        host_user_id: "admin",
        date: new Date(Date.now() + 259200000).toISOString(),
        attendees: 15,
        status: "inactive",
      },
    ];

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Admin sessions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _body = await req.json();
    // In production, save to database.
    return NextResponse.json(
      { success: true, id: Date.now() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin sessions POST error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
