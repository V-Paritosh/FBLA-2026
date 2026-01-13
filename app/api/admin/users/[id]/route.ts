import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/auth";

type RouteParams = { params: { id: string } };

function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) ??
    ["admin@cshub.dev"];
  return !!email && adminEmails.includes(email);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSupabaseUser();
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { isAdmin } = (await req.json()) as { isAdmin?: boolean };
    if (typeof isAdmin !== "boolean") {
      return NextResponse.json(
        { error: "Field `isAdmin` (boolean) is required" },
        { status: 400 }
      );
    }

    const userId = params.id;

    // In production, update MongoDB with new admin status based on userId.
    // For now, just return success.

    return NextResponse.json(
      {
        success: true,
        message: `User ${userId} ${isAdmin ? "promoted" : "demoted"}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
