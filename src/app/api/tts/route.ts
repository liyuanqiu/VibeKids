import { NextRequest, NextResponse } from "next/server";
import { tts } from "@/lib/ai/openai-client";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const result = await tts(text);

    return new NextResponse(result.audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "X-Usage": JSON.stringify(result.usage),
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
