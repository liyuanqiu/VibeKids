import { NextRequest, NextResponse } from "next/server";

const USERS: Record<string, string> = {
  test: "14421",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    if (USERS[username] !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set a simple auth cookie
    const response = NextResponse.json({ ok: true, username });
    response.cookies.set("vibekid_user", username, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
