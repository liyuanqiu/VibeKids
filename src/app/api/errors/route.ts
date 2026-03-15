import { NextRequest, NextResponse } from "next/server";
import { recordError, loadErrorLessons } from "@/lib/data/error-memory";

/** POST: record an error and its fix summary */
export async function POST(request: NextRequest) {
  try {
    const { error, summary } = await request.json();
    if (!error) return NextResponse.json({ error: "Missing error" }, { status: 400 });

    recordError(error, summary || error);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** GET: list all error lessons */
export async function GET() {
  return NextResponse.json(loadErrorLessons());
}
