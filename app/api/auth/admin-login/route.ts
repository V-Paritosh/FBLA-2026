import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // In production, verify with Supabase and check MongoDB for admin flag.
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) =>
      e.trim()
    ) ?? ["admin@codenode.dev"];
    const isAdmin = adminEmails.includes(email);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied. You do not have admin privileges." },
        { status: 403 }
      );
    }

    // Generate a simple token (placeholder).
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

    return NextResponse.json(
      {
        isAdmin: true,
        token,
        message: "Admin login successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
