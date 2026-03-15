import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const username = request.cookies.get("vibekid_user")?.value;
  if (!username) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("vibekid_user");
  return response;
}
