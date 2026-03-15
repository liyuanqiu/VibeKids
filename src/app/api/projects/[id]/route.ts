import { NextRequest, NextResponse } from "next/server";
import { loadProject } from "@/lib/data/projects";

function getUsername(request: NextRequest): string | null {
  return request.cookies.get("vibekid_user")?.value || null;
}

/** GET: load a single project by ID */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const username = getUsername(request);
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const project = loadProject(username, id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}
