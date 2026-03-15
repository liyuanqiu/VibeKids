import { NextRequest, NextResponse } from "next/server";
import { stt } from "@/lib/ai/openai-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const result = await stt(audioFile);

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("STT API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
