import { NextRequest, NextResponse } from "next/server";
import { saveProject, listProjects } from "@/lib/data/projects";

function getUsername(request: NextRequest): string | null {
  return request.cookies.get("vibekid_user")?.value || null;
}

/** POST: save a project */
export async function POST(request: NextRequest) {
  const username = getUsername(request);
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const project = await request.json();
    if (!project.id) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

    saveProject(username, project);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

/** GET: list all projects */
export async function GET(request: NextRequest) {
  const username = getUsername(request);
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const projects = listProjects(username);
  return NextResponse.json(projects);
}
